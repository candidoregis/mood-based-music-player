#!/usr/bin/env python3
"""
API Server for Spotify Song Recommendations and OpenAI Playlist Generation

This Flask API serves as a bridge between the frontend and the Spotify/OpenAI services.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import spotify_get_song
import openai_service
import os
import dotenv

# Load environment variables from .env file
import pathlib
# Get the project root directory (2 levels up from this file)
project_root = pathlib.Path(__file__).parent.parent.parent.absolute()
env_path = project_root / '.env'
print(f"Loading .env from: {env_path}")
dotenv.load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
# Enable CORS with specific settings
CORS(app, resources={r"/*": {"origins": ["http://localhost:8080", "http://127.0.0.1:8080"]}})

@app.route('/api/song', methods=['GET'])
def get_song():
    """
    API endpoint to get a song recommendation based on a genre
    
    Query parameters:
    - genre: The genre to get a song recommendation for
    
    Returns:
    - JSON response with song information or error message
    """
    genre = request.args.get('genre', 'pop')
    result = spotify_get_song.get_song_by_genre(genre)
    return jsonify(result)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/config/youtube', methods=['GET'])
def youtube_config():
    """
    API endpoint to provide YouTube API configuration
    
    Returns:
    - JSON response with YouTube API key
    """
    print("YouTube config endpoint called")
    print(f"Environment variables: {list(os.environ.keys())}")
    
    youtube_api_key = os.environ.get('YOUTUBE_API_KEY')
    print(f"YouTube API key found: {bool(youtube_api_key)}")
    
    if not youtube_api_key:
        error_response = {
            'success': False,
            'error': 'YouTube API key not found in environment variables'
        }
        print(f"Returning error: {error_response}")
        return jsonify(error_response), 500
    
    success_response = {
        'success': True,
        'apiKey': youtube_api_key
    }
    print(f"Returning success: {success_response}")
    return jsonify(success_response)

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """
    API endpoint to get similar song recommendations using OpenAI
    
    Query parameters:
    - title: The title of the song
    - artist: The artist of the song
    - genre: The genre of the song
    - limit: The number of recommendations to return (default: 10)
    - test_error: If 'true', simulates an API failure (for testing)
    
    Returns:
    - JSON response with song recommendations or error message
    """
    title = request.args.get('title', '')
    artist = request.args.get('artist', '')
    genre = request.args.get('genre', '')
    limit = request.args.get('limit', 10)
    test_error = request.args.get('test_error', 'false').lower() == 'true'
    
    try:
        limit = int(limit)
    except ValueError:
        limit = 10
    
    if not title or not artist:
        return jsonify({
            'success': False,
            'error': 'Title and artist are required parameters'
        })
    
    # If test_error is true, simulate an API failure
    if test_error:
        result = openai_service.simulate_api_failure(title, artist, genre, limit, "Test error: OpenAI API failure simulation")
    else:
        result = openai_service.get_similar_songs(title, artist, genre, limit)
    
    return jsonify(result)

@app.route('/', methods=['GET'])
def index():
    # Serve the index.html file from the project root
    return send_from_directory(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')), 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Serve static files from the project root
    return send_from_directory(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')), path)

if __name__ == '__main__':
    # Get port from environment variable or use 5002 as default
    port = int(os.environ.get('PORT', 5002))
    app.run(debug=True, host='0.0.0.0', port=port)
