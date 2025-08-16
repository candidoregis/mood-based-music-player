/**
 * YouTube Service for searching videos and creating playlists
 * This service provides functions to interact with the YouTube API
 * for searching videos and managing playlists
 */

// Variable to store the YouTube API key once retrieved
let YOUTUBE_API_KEY = null;

/**
 * Search for a YouTube video based on song title and artist
 * @param {string} title - The song title
 * @param {string} artist - The artist name
 * @returns {Promise<string>} - A promise that resolves to the YouTube video ID
 * @throws {Error} - If the API call fails or no API key is available
 */
async function searchYouTubeVideo(title, artist) {
  // Create a search query combining title and artist
  const searchQuery = `${title} ${artist} official`;
  
  // Encode the search query for URL
  const encodedQuery = encodeURIComponent(searchQuery);
  
  // If we don't have the API key yet, get it from the server
  if (!YOUTUBE_API_KEY) {
    try {
      // Fetch the API key from our backend
      // Use the full URL including port since the backend is on port 5002
      const response = await fetch('http://localhost:5002/api/config/youtube');
      
      if (!response.ok) {
        throw new Error(`Failed to get YouTube API key: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      YOUTUBE_API_KEY = data.apiKey;
      
      if (!YOUTUBE_API_KEY) {
        throw new Error('No YouTube API key returned from server');
      }
    } catch (error) {
      throw new Error(`Error retrieving YouTube API key: ${error.message}`);
    }
  }
  
  // Use the YouTube Data API
  return await searchWithYouTubeAPI(encodedQuery);
}

/**
 * Search for videos using the YouTube Data API
 * @param {string} query - The encoded search query
 * @returns {Promise<string>} - A promise that resolves to a video ID
 * @throws {Error} - If the API call fails or no results are found
 */
async function searchWithYouTubeAPI(query) {
  // YouTube Data API v3 search endpoint
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`;
  
  // Fetch data from the API
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Check if we have search results
  if (data.items && data.items.length > 0) {
    // Return the video ID of the first result
    return data.items[0].id.videoId;
  } else {
    throw new Error('No YouTube search results found for query: ' + query);
  }
}

/**
 * Create a YouTube playlist from a list of songs
 * @param {Array<Object>} songs - An array of song objects with title and artist properties
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of video objects with id, title, and artist
 * @throws {Error} - If there's an error creating the playlist or if no videos are found
 */
async function createPlaylist(songs) {
  // Array to hold the video IDs
  const videos = [];
  const errors = [];
  
  // For each song, search for a YouTube video
  for (const song of songs) {
    try {
      // Search for the video
      const videoId = await searchYouTubeVideo(song.title, song.artist);
      
      // Add the video to the playlist
      videos.push({
        id: videoId,
        title: song.title,
        artist: song.artist
      });
    } catch (error) {
      // Store the error for reporting
      errors.push(`${song.title} by ${song.artist}: ${error.message}`);
    }
  }
  
  // If no videos were found, throw an error with details
  if (videos.length === 0) {
    throw new Error(`Failed to create playlist. No videos found. Errors: ${errors.join('; ')}`);
  }
  
  // Return the videos that were successfully found
  return videos;
}

export default {
  searchYouTubeVideo,
  createPlaylist
};
