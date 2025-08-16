/**
 * Main Application JavaScript for Mood-Based Music Player
 * This file handles UI interactions, slider updates, and integrates
 * the fuzzy logic system with the Spotify API service and OpenAI for playlist generation.
 */

// Import the services
import spotifyService from '../src/services/spotifyService.js';
import openAIService from '../src/services/openAIService.js';
const { getSongRecommendation } = spotifyService;
const { getSimilarSongs } = openAIService;

// DOM Elements
const moodSlider = document.getElementById('mood');
const energySlider = document.getElementById('energy');
const vibeSlider = document.getElementById('vibe');
const moodValue = document.getElementById('mood-value');
const energyValue = document.getElementById('energy-value');
const vibeValue = document.getElementById('vibe-value');
const calculateBtn = document.getElementById('calculate-btn');
const findMusicBtn = document.getElementById('find-music-btn');
const resultsContainer = document.getElementById('results-container');
const songRecommendation = document.getElementById('song-recommendation');
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

// Application State
let currentMood = 50;
let currentEnergy = 50;
let currentVibe = 50;
let genreRecommendations = [];
let isLoading = false;

// Initialize the application
function init() {
  // Set initial slider values
  moodSlider.value = currentMood;
  energySlider.value = currentEnergy;
  vibeSlider.value = currentVibe;
  
  // Update display values
  updateDisplayValues();
  
  // Add event listeners
  moodSlider.addEventListener('input', handleMoodChange);
  energySlider.addEventListener('input', handleEnergyChange);
  vibeSlider.addEventListener('input', handleVibeChange);
  calculateBtn.addEventListener('click', handleCalculateGenres);
  findMusicBtn.addEventListener('click', handleFindMusic);
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
  // Hide results and reset recommendations
  resultsContainer.style.display = 'none';
  songRecommendation.style.display = 'none';
  genreRecommendations = [];
  findMusicBtn.disabled = true;
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
  
  // Show results and enable find music button
  resultsContainer.style.display = 'block';
  findMusicBtn.disabled = genreRecommendations.length === 0;
  
  // Hide song recommendation if visible
  songRecommendation.style.display = 'none';
}

async function handleFindMusic() {
  if (genreRecommendations.length === 0) {
    handleCalculateGenres();
    return;
  }
  
  // Show loading state
  isLoading = true;
  findMusicBtn.disabled = true;
  findMusicBtn.innerHTML = 'Finding Music <span class="loading"></span>';
  
  try {
    // Get top genre and request song recommendation
    const topGenre = genreRecommendations[0].genre;
    const recommendation = await getSongRecommendation(topGenre);
    
    // Update UI with song recommendation
    songTitle.textContent = recommendation.song;
    songGenre.textContent = `Genre: ${recommendation.genre}`;
    songError.textContent = '';
    songRecommendation.style.display = 'block';
    
    // Parse the song title to get artist and title
    const songParts = recommendation.song.split(' - ');
    if (songParts.length >= 2) {
      const artist = songParts[0].trim();
      const title = songParts[1].trim();
      
      // Get AI-generated playlist recommendations
      await getAIPlaylistRecommendations(title, artist, recommendation.genre);
    }
  } catch (error) {
    console.error('Error finding music:', error);
    songTitle.textContent = 'Rick Astley - Never Gonna Give You Up';
    songGenre.textContent = '';
    songError.textContent = 'Failed to get song recommendation from API';
    songRecommendation.style.display = 'block';
  } finally {
    // Reset loading state
    isLoading = false;
    findMusicBtn.disabled = false;
    findMusicBtn.innerHTML = 'Find Music';
  }
}

// Helper function to update display values
function updateDisplayValues() {
  moodValue.textContent = currentMood;
  energyValue.textContent = currentEnergy;
  vibeValue.textContent = currentVibe;
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
    // Create a loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'ai-playlist-loading';
    loadingDiv.className = 'loading-message';
    loadingDiv.textContent = 'Generating AI playlist recommendations...';
    songRecommendation.appendChild(loadingDiv);
    
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
    
    // Display error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Failed to get AI playlist recommendations';
    songRecommendation.appendChild(errorDiv);
  }
}

/**
 * Display AI-generated playlist recommendations
 * @param {Object} data - The recommendations data from the API
 */
function displayAIRecommendations(data) {
  // Check if we have valid data
  if (!data || !data.recommendations || data.recommendations.length === 0) {
    const noRecsDiv = document.createElement('div');
    noRecsDiv.className = 'no-recommendations';
    noRecsDiv.textContent = 'No recommendations available';
    songRecommendation.appendChild(noRecsDiv);
    return;
  }
  
  // Create container for AI recommendations
  const aiRecsContainer = document.createElement('div');
  aiRecsContainer.id = 'ai-recommendations';
  aiRecsContainer.className = 'ai-recommendations';
  
  // Create header
  const header = document.createElement('h3');
  header.textContent = 'AI-Generated Playlist';
  aiRecsContainer.appendChild(header);
  
  // Create source track info
  const sourceTrack = document.createElement('div');
  sourceTrack.className = 'source-track';
  sourceTrack.textContent = `Based on: ${data.source_song.title} by ${data.source_song.artist}`;
  aiRecsContainer.appendChild(sourceTrack);
  
  // Create playlist
  const playlist = document.createElement('ol');
  playlist.className = 'ai-playlist';
  
  // Add each recommendation to the playlist
  data.recommendations.forEach(rec => {
    const item = document.createElement('li');
    item.className = 'playlist-item';
    
    const title = document.createElement('div');
    title.className = 'playlist-title';
    title.textContent = `${rec.title} - ${rec.artist}`;
    
    const reason = document.createElement('div');
    reason.className = 'playlist-reason';
    reason.textContent = rec.reason || 'Similar style and mood';
    
    item.appendChild(title);
    item.appendChild(reason);
    playlist.appendChild(item);
  });
  
  aiRecsContainer.appendChild(playlist);
  songRecommendation.appendChild(aiRecsContainer);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
