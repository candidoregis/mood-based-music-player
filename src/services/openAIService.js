/**
 * OpenAI Service - Wrapper for OpenAI API integration
 * This service provides functions to get similar song recommendations using OpenAI's GPT model
 */

/**
 * Get similar song recommendations from the backend API
 * @param {string} title - The title of the song
 * @param {string} artist - The artist of the song
 * @param {string} genre - The genre of the song
 * @returns {Promise<Object>} - A promise that resolves to the song recommendations
 */
export const getSimilarSongsFromApi = async (title, artist, genre) => {
  try {
    // Call the Flask API endpoint that connects to OpenAI
    const response = await fetch(`http://localhost:5002/api/recommendations?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&genre=${encodeURIComponent(genre)}`, {
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
    console.error('Error getting similar songs:', error);
    // Return fallback recommendations
    return {
      source_song: {
        title: title || 'Unknown Title',
        artist: artist || 'Unknown Artist',
        genre: genre || 'pop'
      },
      recommendations: [
        { title: 'Billie Jean', artist: 'Michael Jackson', reason: 'Classic pop hit with a similar vibe' },
        { title: 'Shape of You', artist: 'Ed Sheeran', reason: 'Modern pop with catchy rhythm' },
        { title: 'Uptown Funk', artist: 'Mark Ronson', reason: 'Energetic and fun' },
        { title: 'Bad Guy', artist: 'Billie Eilish', reason: 'Contemporary pop with unique style' },
        { title: 'Blinding Lights', artist: 'The Weeknd', reason: 'Popular synth-pop track' },
        { title: 'Dance Monkey', artist: 'Tones and I', reason: 'Catchy pop melody' },
        { title: 'Watermelon Sugar', artist: 'Harry Styles', reason: 'Upbeat summer vibe' },
        { title: 'Don\'t Start Now', artist: 'Dua Lipa', reason: 'Modern disco-pop sound' },
        { title: 'Levitating', artist: 'Dua Lipa', reason: 'Danceable pop track' },
        { title: 'Stay', artist: 'The Kid LAROI', reason: 'Contemporary pop collaboration' }
      ],
      error: error.message || 'Failed to get song recommendations'
    };
  }
};

/**
 * Get similar song recommendations based on a song
 * This is the main function that should be used by the application
 * @param {Object} song - The song object with title, artist, and genre
 * @returns {Promise<Object>} - A promise that resolves to the song recommendations
 */
export const getSimilarSongs = async (song) => {
  if (!song || !song.title || !song.artist) {
    return { error: 'Invalid song data' };
  }
  
  const { title, artist, genre } = song;
  return getSimilarSongsFromApi(title, artist, genre || 'unknown');
};

// Create a named export object
const openAIService = {
  getSimilarSongs,
  getSimilarSongsFromApi
};

// Export the service object
export default openAIService;
