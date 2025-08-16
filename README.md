# Mood-Based Music Player

A React application that recommends music genres based on mood using fuzzy logic and retrieves song recommendations from Spotify.

## Overview

This application uses:
- Fuzzy logic to determine music genres based on mood, energy, and vibe inputs
- Spotify API to retrieve song recommendations for the selected genres
- React for the frontend user interface
- Flask API to serve as a bridge between the React frontend and the Spotify API

**Note:** This application requires valid Spotify API credentials to function properly. There is no mock data fallback.

## Setup

### Prerequisites

- Node.js and npm
- Python 3.x
- Spotify Developer Account

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

1. Install JavaScript dependencies:
```
npm install
```

2. Install Python dependencies:
```
pip install flask flask-cors requests python-dotenv fuzzysearch
```

## Running the Application

1. Start the Flask API server (runs on port 5002):
```
cd src/services
python api.py
```

2. In a separate terminal, start the React development server:
```
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## How It Works

1. Adjust the mood, energy, and vibe sliders in the UI
2. The fuzzy logic system determines the most appropriate music genres
3. The top genre is sent to the Spotify API to get a song recommendation
4. The recommended song is displayed in the UI

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
