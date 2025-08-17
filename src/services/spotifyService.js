/**
 * Spotify Service - Wrapper for the Spotify song recommendation functionality
 * This service provides functions to get song recommendations based on genres
 * It uses the real API implementation to fetch song recommendations from the backend
 */

/**
 * Get a song recommendation based on a genre from the backend API
 * @param {string} genre - The genre to get a song recommendation for
 * @returns {Promise<Object>} - A promise that resolves to the song recommendation
 */
export const getSongByGenreFromApi = async (genre) => {
  try {
    // Call the Flask API endpoint that connects to the Python script
    const response = await fetch(`http://localhost:5002/api/song?genre=${encodeURIComponent(genre)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting song by genre:', error);
    // Return a fallback song recommendation with error info
    return {
      song: 'Rick Astley - Never Gonna Give You Up',
      genre: 'pop',
      error: error.message || 'Failed to get song recommendation'
    };
  }
};

/**
 * Get a song recommendation based on a genre
 * This is the main function that should be used by the application
 * @param {string} genre - The genre to get a song recommendation for
 * @returns {Promise<Object>} - A promise that resolves to the song recommendation
 */
export const getSongRecommendation = async (genre) => {
  return getSongByGenreFromApi(genre);
};

// Create a named export object to fix ESLint warning
const spotifyService = {
  getSongRecommendation,
  getSongByGenreFromApi
};

// Export the service object
export default spotifyService;
