/**
 * Main Application JavaScript for Mood-Based Music Player
 * This file handles UI interactions, slider updates, and integrates
 * the fuzzy logic system with the Spotify API service.
 */

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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
