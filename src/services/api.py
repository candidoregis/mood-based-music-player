#!/usr/bin/env python3
"""
API Server for Spotify Song Recommendations

This Flask API serves as a bridge between the React frontend and the Spotify song retrieval script.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import spotify_get_song
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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

if __name__ == '__main__':
    # Get port from environment variable or use 5002 as default
    port = int(os.environ.get('PORT', 5002))
    app.run(debug=True, host='0.0.0.0', port=port)
