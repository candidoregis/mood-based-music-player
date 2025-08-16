# Mood-Based Music Player

A vanilla JavaScript application that recommends music genres based on mood using fuzzy logic and retrieves song recommendations from Spotify.

## Overview

This application uses:
- Fuzzy logic to determine music genres based on mood, energy, and vibe inputs
- Spotify API to retrieve song recommendations for the selected genres
- Vanilla JavaScript for the frontend user interface
- Flask API to serve both static files and handle Spotify API requests

**Note:** This application requires valid Spotify API credentials to function properly. There is no mock data fallback.

## Setup

### Prerequisites

- Python 3.x
- Spotify Developer Account
- Modern web browser

### Spotify API Credentials

1. Create a Spotify Developer account at [https://developer.spotify.com/dashboard/](https://developer.spotify.com/dashboard/)
2. Create a new application to get your Client ID and Client Secret
3. Create a `.env` file in the root directory with the following content:
```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

**Important:** Valid Spotify API credentials are required. The application will not function without them.

### Installation

1. Install Python dependencies:
```
pip install flask flask-cors requests python-dotenv fuzzysearch
```

## Running the Application

1. Start the Flask API server (runs on port 5002):
```
cd src/services
python api.py
```

2. Open [http://localhost:5002](http://localhost:5002) to view the application in your browser.

## How It Works

1. Adjust the mood, energy, and vibe sliders in the UI
2. The fuzzy logic system determines the most appropriate music genres
3. The top genre is sent to the Spotify API to get a song recommendation
4. The recommended song is displayed in the UI

---

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css         # CSS styles
├── js/                # JavaScript files
│   ├── app.js         # Main application logic
│   ├── fuzzyLogic.js  # Fuzzy logic implementation
│   └── spotifyService.js # Spotify API integration
├── public/            # Public assets
│   └── favicon.ico    # Favicon
└── src/               # Backend source code
    └── services/      # Flask API services
        ├── api.py     # Flask API server
        ├── genres.json # Genre data
        └── spotify_get_song.py # Spotify integration
```

## Technical Details

### Fuzzy Logic System

The application uses a fuzzy logic system to determine appropriate music genres based on three inputs:

1. **Mood** - From sad to happy (0-100)
2. **Energy** - From low to high (0-100)
3. **Vibe** - From chill to intense (0-100)

The fuzzy logic system uses triangular and trapezoidal membership functions to calculate the degree of membership in various fuzzy sets, and then applies inference rules to determine the most appropriate music genres.

### Flask API

The Flask API serves two purposes:

1. Serving the static HTML, CSS, and JavaScript files
2. Providing an endpoint to get song recommendations from Spotify based on genre

### Browser Support

The application should work in all modern browsers that support ES6 features.
