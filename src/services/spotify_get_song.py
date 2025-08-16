#!/usr/bin/env python3

import base64
import json
import os
import random
import re
import requests
import sys
import urllib
from dotenv import load_dotenv
from fuzzysearch import find_near_matches

# Load environment variables from .env file
load_dotenv()

# Get Client Keys from environment variables
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

# Ensure credentials are available
if not (CLIENT_ID and CLIENT_SECRET):
    raise ValueError("Spotify API credentials not found. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file.")

# Spotify API URIs
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE_URL = "https://api.spotify.com"
API_VERSION = "v1"
SPOTIFY_API_URL = "{}/{}".format(SPOTIFY_API_BASE_URL, API_VERSION)


def get_token():
    """Get a Spotify API token using client credentials"""
    # Validate credentials
    if not CLIENT_ID or not CLIENT_SECRET:
        raise ValueError("Spotify API credentials not found or invalid.")
        
    auth_str = "{}:{}".format(CLIENT_ID, CLIENT_SECRET)
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()
    
    headers = {
        "Authorization": "Basic {}".format(b64_auth_str)
    }
    
    payload = {
        "grant_type": "client_credentials"
    }
    
    try:
        response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=payload)
        
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            error_msg = f"Failed to get token: {response.status_code} - {response.text}"
            raise ValueError(error_msg)
    except Exception as e:
        raise ValueError(f"Error getting Spotify token: {str(e)}")


def request_valid_song(access_token, genre=None):
    """Request a song from the Spotify API"""
    # Set default genre if none provided
    if not genre:
        genre = "pop"
        
    try:
        headers = {
            "Authorization": "Bearer {}".format(access_token)
        }
        
        # Use a wildcard query to get a random song
        wildcard_queries = ["a", "e", "i", "o", "u"]
        query = random.choice(wildcard_queries)
        
        # Build the search query
        search_params = {
            "q": query,
            "type": "track",
            "limit": 50
        }
        
        # Add genre filter if provided
        if genre:
            search_params["seed_genres"] = genre
        
        # Make the API request
        search_url = "{}/search".format(SPOTIFY_API_URL)
        response = requests.get(search_url, headers=headers, params=search_params)
        
        # Parse the response
        json_data = response.json()
        
        # Extract a random song from the results
        song = None
        artist = None
        
        if "tracks" in json_data and "items" in json_data["tracks"] and len(json_data["tracks"]["items"]) > 0:
            # Get a random track from the results
            random_track = random.choice(json_data["tracks"]["items"])
            
            try:
                song = random_track["name"]
                artist = random_track["artists"][0]["name"]
            except (IndexError, KeyError):
                pass
            
        if song is None:
            raise ValueError("No songs found for the given genre")
            
        return "{} - {}".format(artist, song)
    except Exception as e:
        return f"Error: {str(e)}"


def get_song_by_genre(genre):
    """
    Function to be called from JavaScript to get a song recommendation based on a genre
    """
    try:
        # Get a Spotify API token
        access_token = get_token()
        
        # Open genres file - use absolute path for reliability when called from JS
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        genres_path = os.path.join(script_dir, 'genres.json')
        
        try:
            with open(genres_path, 'r') as infile:
                valid_genres = json.load(infile)
        except FileNotFoundError:
            return {"error": "Couldn't find genres file!"}
        
        # Normalize the genre name
        selected_genre = genre.lower()
        
        # Call the API for a song that matches the criteria
        if selected_genre in valid_genres:
            result = request_valid_song(access_token, genre=selected_genre)
            return {"song": result, "genre": selected_genre}
        else:
            # If genre not found as it is, try fuzzy search with Levenhstein distance 2
            valid_genres_to_text = " ".join(valid_genres)
            try:
                closest_genre = find_near_matches(selected_genre, valid_genres_to_text, max_l_dist=2)[0].matched
                result = request_valid_song(access_token, genre=closest_genre)
                return {"song": result, "genre": closest_genre, "original_genre": selected_genre}
            except IndexError:
                # If no match found, use a default genre
                default_genre = "pop"
                result = request_valid_song(access_token, genre=default_genre)
                return {"song": result, "genre": default_genre, "original_genre": selected_genre, "note": "Genre not found, using pop instead"}
    except ValueError as ve:
        # Handle specific value errors (like missing API credentials)
        return {"error": str(ve)}
    except Exception as e:
        # Handle any other exceptions
        return {"error": f"Unexpected error: {str(e)}"}


def main():
    """
    Command line interface for testing
    """
    args = sys.argv[1:]
    n_args = len(args)

    if n_args == 0:
        # Pick a random genre if none provided
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        genres_path = os.path.join(script_dir, 'genres.json')
        
        try:
            with open(genres_path, 'r') as infile:
                valid_genres = json.load(infile)
                selected_genre = random.choice(valid_genres)
        except FileNotFoundError:
            print("Couldn't find genres file!")
            sys.exit(1)
    else:
        selected_genre = (" ".join(args)).lower()
    
    # Use the new function
    result = get_song_by_genre(selected_genre)
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()