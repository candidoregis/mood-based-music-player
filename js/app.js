/**
 * Main Application JavaScript for Mood-Based Music Player
 * This file handles UI interactions, slider updates, and integrates
 * the fuzzy logic system with the Spotify API service and OpenAI for playlist generation.
 */

// Import the services
import spotifyService from '../src/services/spotifyService.js';
import openAIService from '../src/services/openAIService.js';
import youtubeService from '../src/services/youtubeService.js';
import youtubePlayerService from '../src/services/youtubePlayerService.js';
const { getSongRecommendation } = spotifyService;
const { getSimilarSongs } = openAIService;
const { createPlaylist } = youtubeService;

// DOM References
const moodSlider = document.getElementById('mood');
const energySlider = document.getElementById('energy');
const vibeSlider = document.getElementById('vibe');
const calculateBtn = document.getElementById('calculate-btn');
const findMusicBtn = document.getElementById('find-music-btn');
const moodValue = document.getElementById('mood-value');
const energyValue = document.getElementById('energy-value');
const vibeValue = document.getElementById('vibe-value');
const moodDescription = document.getElementById('mood-description');
const detailMood = document.getElementById('detail-mood');
const detailEnergy = document.getElementById('detail-energy');
const detailVibe = document.getElementById('detail-vibe');
const moodBar = document.getElementById('mood-bar');
const energyBar = document.getElementById('energy-bar');
const vibeBar = document.getElementById('vibe-bar');
const genreList = document.getElementById('genre-list');
const songTitle = document.getElementById('song-title');
const songGenre = document.getElementById('song-genre');
const songError = document.getElementById('song-error');

// Card layout references
const cardsContainer = document.getElementById('cards-container');
const sliderCard = document.getElementById('mood-selection-card');
const resultsCard = document.getElementById('results-card');
const youtubeCard = document.getElementById('youtube-card');

// YouTube Player DOM Elements
const youtubeContainer = document.getElementById('youtube-container');
const youtubePlayer = document.getElementById('youtube-player');
const youtubePlaylist = document.getElementById('youtube-playlist');
const prevButton = document.getElementById('prev-button');
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');
const nextButton = document.getElementById('next-button');

// Application State
let currentMood = 50;
let currentEnergy = 50;
let currentVibe = 50;
let genreRecommendations = [];
let isLoading = false;

// Initialize the app
function init() {
  // Set initial values
  currentMood = parseInt(moodSlider.value);
  currentEnergy = parseInt(energySlider.value);
  currentVibe = parseInt(vibeSlider.value);
  
  // Update value displays
  moodValue.textContent = currentMood;
  energyValue.textContent = currentEnergy;
  vibeValue.textContent = currentVibe;
  
  // Add event listeners
  moodSlider.addEventListener('input', handleMoodChange);
  energySlider.addEventListener('input', handleEnergyChange);
  vibeSlider.addEventListener('input', handleVibeChange);
  calculateBtn.addEventListener('click', handleCalculateGenres);
  findMusicBtn.addEventListener('click', handleFindMusic);
  
  // Initialize YouTube player
  youtubePlayerService.init(youtubePlayer, playButton, pauseButton, nextButton, prevButton);
  
  // Set up player control event listeners
  playButton.addEventListener('click', handlePlayClick);
  pauseButton.addEventListener('click', handlePauseClick);
  nextButton.addEventListener('click', handleNextClick);
  prevButton.addEventListener('click', handlePrevClick);
  
  // Show all cards at startup
  sliderCard.style.display = 'block';
  resultsCard.style.display = 'block';
  youtubeCard.style.display = 'block';
  
  // Initialize YouTube player with placeholder content
  initPlaceholderYouTubePlayer();
  
  // Update layout
  updateCardsLayout();
}

// Event Handlers
function handleMoodChange(event) {
  currentMood = parseInt(event.target.value);
  moodValue.textContent = currentMood;
  resetResults();
}

function handleEnergyChange(event) {
  currentEnergy = parseInt(event.target.value);
  energyValue.textContent = currentEnergy;
  resetResults();
}

function handleVibeChange(event) {
  currentVibe = parseInt(event.target.value);
  vibeValue.textContent = currentVibe;
  resetResults();
}

function resetResults() {
  // Reset recommendations but keep cards visible
  genreRecommendations = [];
  findMusicBtn.disabled = true;
  
  // Keep all cards visible
  sliderCard.style.display = 'block';
  resultsCard.style.display = 'block';
  youtubeCard.style.display = 'block';
  
  // Update cards container layout
  updateCardsLayout();
}

/**
 * Updates the cards container layout based on visible cards
 */
function updateCardsLayout() {
  // Count visible cards
  const visibleCards = Array.from(cardsContainer.children)
    .filter(card => card.style.display !== 'none');
  const visibleCount = visibleCards.length;
  
  console.log(`Updating cards layout: ${visibleCount} visible cards`);
  visibleCards.forEach(card => {
    console.log(`Visible card: ${card.id}`);
  });
  
  // Update container styles based on number of visible cards
  if (visibleCount === 1) {
    // Center the single card
    cardsContainer.style.justifyContent = 'center';
  } else {
    // Space cards evenly
    cardsContainer.style.justifyContent = 'center';
  }
  
  // Update card widths based on number of visible cards
  visibleCards.forEach(card => {
    if (visibleCount === 1) {
      card.style.maxWidth = '500px';
    } else if (visibleCount === 2) {
      card.style.maxWidth = '450px';
    } else {
      card.style.maxWidth = '350px';
    }
    
    // Ensure card is fully visible
    card.style.opacity = '1';
    card.style.height = 'auto';
    card.style.overflow = 'visible';
  });
  
  // Special handling for YouTube card
  if (youtubeCard.style.display === 'block') {
    youtubeCard.style.minHeight = '500px';
    youtubeCard.style.opacity = '1';
  }
}

// YouTube Player Event Handlers
function onYouTubePlayerReady() {
  console.log('YouTube player is ready');
}

function handlePlayVideo() {
  youtubePlayerService.playVideo();
}

function handlePauseVideo() {
  youtubePlayerService.pauseVideo();
}

function handleNextVideo() {
  youtubePlayerService.playNextVideo();
}

function handlePrevVideo() {
  youtubePlayerService.playPreviousVideo();
}

function handleCalculateGenres() {
  // Get fuzzy recommendations based on current slider values
  genreRecommendations = getFuzzyRecommendations(currentMood, currentEnergy, currentVibe);
  
  // Get mood state description
  const moodState = getMoodState(currentMood, currentEnergy, currentVibe);
  
  // Update UI with mood analysis
  moodDescription.textContent = moodState.description;
  detailMood.textContent = moodState.mood;
  detailEnergy.textContent = moodState.energy;
  detailVibe.textContent = moodState.vibe;
  
  // Update progress bars
  moodBar.style.width = `${moodState.moodValue * 100}%`;
  energyBar.style.width = `${moodState.energyValue * 100}%`;
  vibeBar.style.width = `${moodState.vibeValue * 100}%`;
  
  // Clear and update genre list
  genreList.innerHTML = '';
  genreRecommendations.forEach(genre => {
    const li = document.createElement('li');
    li.className = 'genre-item';
    li.innerHTML = `
      <span class="genre-name">${genre.genre}</span>
      <div class="strength-bar-container">
        <div class="strength-bar" style="width: ${genre.strength}%"></div>
      </div>
      <span class="strength-value">${genre.strength}%</span>
    `;
    genreList.appendChild(li);
  });
  
  // Ensure all cards are visible
  sliderCard.style.display = 'block';
  resultsCard.style.display = 'block';
  youtubeCard.style.display = 'block';
  
  // Enable find music button if we have recommendations
  findMusicBtn.disabled = genreRecommendations.length === 0;
  
  // Update legacy containers for compatibility
  resultsContainer.style.display = 'block';
  
  // Update cards layout
  updateCardsLayout();
}

async function handleFindMusic() {
  if (genreRecommendations.length === 0) {
    handleCalculateGenres();
    return;
  }
  
  // Show loading state
  isLoading = true;
  findMusicBtn.disabled = true;
  findMusicBtn.innerHTML = '<span class="spinner"></span> Finding music...';
  
  try {
    // Get the top genre from recommendations
    const topGenre = genreRecommendations[0].genre;
    
    // Get song recommendation from API
    const recommendation = await getSongRecommendation(topGenre);
    
    // Display the song recommendation
    songTitle.textContent = `${recommendation.song}`;
    songGenre.textContent = `Genre: ${recommendation.genre}`;
    
    // Clear any previous error
    if (songError) {
      songError.textContent = '';
    }
    if (recommendation.error) {
      songError.textContent = recommendation.error;
    } else {
      songError.textContent = '';
    }
    
    // Removed reference to songRecommendation
    
    // Parse the song title to get artist and title
    const songParts = recommendation.song.split(' - ');
    if (songParts.length === 2) {
      const artist = songParts[0];
      const title = songParts[1];
      
      // Get AI recommendations first, which will create the YouTube playlist
      await getAIPlaylistRecommendations(title, artist, recommendation.genre);
    }
  } catch (error) {
    console.error('Error finding music:', error);
    // Only use Rick Astley as fallback if we have a serious error
    if (!songTitle.textContent || songTitle.textContent === '') {
      songTitle.textContent = 'Rick Astley - Never Gonna Give You Up';
      songGenre.textContent = 'Genre: pop';
    }
    songError.textContent = error.message || 'Failed to get song recommendation from API';
  } finally {
    // Reset loading state
    isLoading = false;
    findMusicBtn.disabled = false;
    findMusicBtn.innerHTML = 'Find Music';
    
    // Ensure all cards remain visible
    sliderCard.style.display = 'block';
    resultsCard.style.display = 'block';
    youtubeCard.style.display = 'block';
    
    // Update cards layout
    updateCardsLayout();
  }
}

// Helper function to update display values
function updateDisplayValues() {
  moodValue.textContent = currentMood;
  energyValue.textContent = currentEnergy;
  vibeValue.textContent = currentVibe;
}

/**
 * Initialize YouTube player with placeholder content
 */
function initPlaceholderYouTubePlayer() {
  // Add placeholder text to YouTube player
  const placeholderDiv = document.createElement('div');
  placeholderDiv.className = 'placeholder-content';
  placeholderDiv.innerHTML = `
    <h3>YouTube Player</h3>
    <p>Click "Find Music" to load videos based on your mood</p>
    <div class="placeholder-controls">
      <button disabled>Play</button>
      <button disabled>Pause</button>
      <button disabled>Next</button>
      <button disabled>Previous</button>
    </div>
  `;
  
  // Clear and add placeholder to YouTube container
  youtubeContainer.innerHTML = '';
  youtubeContainer.appendChild(placeholderDiv);
  
  // Add placeholder items to playlist
  youtubePlaylist.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const placeholderItem = document.createElement('div');
    placeholderItem.className = 'playlist-item placeholder';
    placeholderItem.innerHTML = `
      <div class="placeholder-thumbnail"></div>
      <div class="playlist-item-info">
        <h4>Video will appear here</h4>
        <p>Channel name</p>
      </div>
    `;
    youtubePlaylist.appendChild(placeholderItem);
  }
}

/**
 * Get AI-generated playlist recommendations based on a song
 * @param {string} title - The title of the song
 * @param {string} artist - The artist of the song
 * @param {string} genre - The genre of the song
 * @returns {Promise<void>}
 */
async function getAIPlaylistRecommendations(title, artist, genre) {
  try {
    // Create a loading message in the YouTube player area
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'ai-playlist-loading';
    loadingDiv.className = 'loading-message';
    loadingDiv.textContent = 'Generating AI playlist recommendations...';
    youtubePlaylist.appendChild(loadingDiv);
    
    // Get song recommendations from OpenAI
    const songData = { title, artist, genre };
    const recommendations = await getSimilarSongs(songData);
    
    // Remove loading message
    const loadingElement = document.getElementById('ai-playlist-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    // Display the recommendations
    displayAIRecommendations(recommendations);
  } catch (error) {
    console.error('Error getting AI playlist recommendations:', error);
    
    // Remove loading message if it exists
    const loadingElement = document.getElementById('ai-playlist-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    // Display error message in the YouTube playlist area
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Failed to get AI playlist recommendations';
    youtubePlaylist.appendChild(errorDiv);
  }
}

/**
 * Process AI-generated playlist recommendations
 * @param {Object} data - The recommendations data from the API
 */
function displayAIRecommendations(data) {
  // Check if we have valid data
  if (!data || !data.recommendations || data.recommendations.length === 0) {
    console.log('No recommendations available');
    return;
  }
  
  // Create YouTube playlist from AI recommendations
  try {
    // Make a copy of the recommendations array to avoid any reference issues
    const playlistSongs = [...data.recommendations];
    console.log('Creating YouTube playlist with', playlistSongs.length, 'songs');
    
    // Add the source song at the beginning if available
    if (data.source_song && data.source_song.title && data.source_song.artist) {
      playlistSongs.unshift({
        title: data.source_song.title,
        artist: data.source_song.artist
      });
    }
    
    // Create the YouTube playlist with all songs
    createYouTubePlaylist(playlistSongs);
  } catch (error) {
    console.error('Error creating YouTube playlist from AI recommendations:', error);
  }
}

/**
 * Create a YouTube playlist from AI recommendations
 * @param {Array<Object>} recommendations - The array of song recommendations
 */
async function createYouTubePlaylist(recommendations) {
  try {
    console.log('Creating YouTube playlist with recommendations:', recommendations);
    
    // Ensure we have valid recommendations
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      throw new Error('No valid recommendations provided for playlist');
    }
    
    // First make sure the YouTube card is visible with proper display
    youtubeCard.style.display = 'block';
    youtubeCard.style.opacity = '1';
    
    // Show loading message for YouTube playlist
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'youtube-playlist-loading';
    loadingDiv.className = 'loading-message';
    loadingDiv.textContent = 'Creating YouTube playlist...';
    
    // Clear any previous content in the playlist area
    if (youtubePlaylist) {
      youtubePlaylist.innerHTML = '';
      youtubePlaylist.appendChild(loadingDiv);
    }
    
    // Force layout recalculation
    youtubeCard.offsetHeight;
    
    // Update cards layout immediately
    updateCardsLayout();
    
    // Create a playlist from the recommendations
    const videos = await createPlaylist(recommendations);
    console.log('Videos for playlist:', videos);
    
    // Remove loading message
    const loadingElement = document.getElementById('youtube-playlist-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    // Make sure the YouTube player element exists and is empty
    const playerElement = document.getElementById('youtube-player');
    if (playerElement) {
      // Clear any previous content
      while (playerElement.firstChild) {
        playerElement.removeChild(playerElement.firstChild);
      }
      
      // Initialize the YouTube player
      console.log('Initializing YouTube player in element:', playerElement);
      youtubePlayerService.initPlayer('youtube-player', () => {
        console.log('YouTube player initialized successfully');
        // Set the playlist in the YouTube player
        youtubePlayerService.setPlaylist(videos);
        
        // Make sure event listeners are attached
        document.getElementById('prev-button').addEventListener('click', handlePrevVideo);
        document.getElementById('play-button').addEventListener('click', handlePlayVideo);
        document.getElementById('pause-button').addEventListener('click', handlePauseVideo);
        document.getElementById('next-button').addEventListener('click', handleNextVideo);
      });
    } else {
      console.error('YouTube player element not found');
    }
    
    // Force another layout update after player initialization
    setTimeout(() => {
      updateCardsLayout();
      console.log('Cards layout updated after player initialization');
    }, 1000);
    
    // Return the created videos for reference
    return videos;
  } catch (error) {
    console.error('Error creating YouTube playlist:', error);
    
    // Remove loading message if it exists
    const loadingElement = document.getElementById('youtube-playlist-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    // Make sure the YouTube card is visible
    youtubeCard.style.display = 'block';
    youtubeCard.style.opacity = '1';
    
    // Display error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<strong>YouTube API Error:</strong><br>${error.message || 'Unknown error occurred'}`;
    
    // Add the error message to the playlist area
    if (youtubePlaylist) {
      youtubePlaylist.innerHTML = '';
      youtubePlaylist.appendChild(errorDiv);
    }
    
    // Force layout update
    updateCardsLayout();
    
    // Re-throw the error for handling
    throw error;
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
