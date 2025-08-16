#!/usr/bin/env python3
"""
OpenAI Service - Integration with OpenAI's GPT model for song recommendations
This service provides functions to get similar song recommendations using OpenAI's GPT model
"""

import os
import json
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPEN_AI_KEY")

def get_similar_songs(title, artist, genre, limit=10):
    """
    Get similar song recommendations using OpenAI's GPT model
    
    Args:
        title (str): The title of the song
        artist (str): The artist of the song
        genre (str): The genre of the song
        limit (int): The number of recommendations to return
        
    Returns:
        dict: A dictionary containing the recommendations or an error message
    """
    try:
        # Create a prompt for OpenAI
        prompt = f"""
        I'm looking for {limit} songs similar to "{title}" by {artist} in the {genre} genre.
        Please provide a list of songs with their artists that have a similar style, mood, or theme.
        Format the response as a JSON array with objects containing 'title', 'artist', and a brief 'reason' for the recommendation.
        """
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a music recommendation assistant that provides similar song suggestions based on a given song."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        # Extract the response text
        response_text = response.choices[0].message.content
        
        # Try to parse the JSON response
        try:
            # Find JSON content in the response (it might be wrapped in markdown code blocks)
            json_start = response_text.find('[')
            json_end = response_text.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_content = response_text[json_start:json_end]
                recommendations = json.loads(json_content)
            else:
                # If no JSON array found, try to parse the whole response
                recommendations = json.loads(response_text)
                
            # Ensure we have the right format
            if not isinstance(recommendations, list):
                raise ValueError("Response is not a list")
                
            # Limit the number of recommendations
            recommendations = recommendations[:limit]
            
            return {
                "success": True,
                "source_song": {
                    "title": title,
                    "artist": artist,
                    "genre": genre
                },
                "recommendations": recommendations
            }
            
        except json.JSONDecodeError:
            # If JSON parsing fails, format the response manually
            lines = response_text.strip().split('\n')
            recommendations = []
            
            for i, line in enumerate(lines):
                if i >= limit:
                    break
                    
                if ':' in line:
                    parts = line.split('-', 1)
                    if len(parts) == 2:
                        song_info = parts[0].strip()
                        reason = parts[1].strip() if len(parts) > 1 else "Similar style and mood"
                        
                        # Try to separate artist and title
                        if ' by ' in song_info:
                            title_part, artist_part = song_info.split(' by ', 1)
                            recommendations.append({
                                "title": title_part.strip('"\''),
                                "artist": artist_part.strip(),
                                "reason": reason
                            })
            
            return {
                "success": True,
                "source_song": {
                    "title": title,
                    "artist": artist,
                    "genre": genre
                },
                "recommendations": recommendations if recommendations else [
                    {"title": f"Similar to {title}", "artist": artist, "reason": "AI couldn't parse recommendations properly"}
                ]
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "source_song": {
                "title": title,
                "artist": artist,
                "genre": genre
            }
        }

def simulate_api_failure(title, artist, genre, limit=10, error_message="Simulated API failure"):
    """
    Simulate an API failure for testing purposes
    
    Args:
        title (str): The title of the song
        artist (str): The artist of the song
        genre (str): The genre of the song
        limit (int): The number of recommendations to return
        error_message (str): The error message to return
        
    Returns:
        dict: A dictionary containing the error message
    """
    return {
        "success": False,
        "error": error_message,
        "source_song": {
            "title": title,
            "artist": artist,
            "genre": genre
        }
    }

# Test the function if run directly
if __name__ == "__main__":
    result = get_similar_songs("Bohemian Rhapsody", "Queen", "Rock")
    print(json.dumps(result, indent=2))
