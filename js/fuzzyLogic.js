/**
 * Fuzzy Logic System for Mood-Based Music Player
 * This module implements a simple fuzzy logic system to provide music recommendations
 * based on mood, energy, and vibe inputs.
 */

// Helper functions for membership calculations

/**
 * Triangular membership function
 * @param {number} x - Input value
 * @param {number} a - Start point (membership = 0)
 * @param {number} b - Peak point (membership = 1)
 * @param {number} c - End point (membership = 0)
 * @returns {number} - Membership value between 0 and 1
 */
const triangular = (x, a, b, c) => {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > b && x < c) return (c - x) / (c - b);
  return 0;
};

/**
 * Trapezoidal membership function
 * @param {number} x - Input value
 * @param {number} a - Start point (membership = 0)
 * @param {number} b - First peak point (membership = 1)
 * @param {number} c - Second peak point (membership = 1)
 * @param {number} d - End point (membership = 0)
 * @returns {number} - Membership value between 0 and 1
 */
const trapezoidal = (x, a, b, c, d) => {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > c && x < d) return (d - x) / (d - c);
  return 0;
};

// Scale input from 0-100 to 0-10 range
const scaleInput = (value) => {
  return (value / 100) * 10;
};

// Mood membership functions
const getMoodMembership = (value) => {
  // Scale input from 0-100 to 0-10
  const x = scaleInput(value);
  
  // Mood membership functions with new values
  // Depressed: trapezoid (0, 0, 1.5, 3)
  const depressed = trapezoidal(x, 0, 0, 1.5, 3);
  
  // Sad: triangle (2, 4, 5.5)
  const sad = triangular(x, 2, 4, 5.5);
  
  // Neutral: triangle (4.5, 5.5, 6.5)
  const neutral = triangular(x, 4.5, 5.5, 6.5);
  
  // Happy: triangle (6, 7.5, 9)
  const happy = triangular(x, 6, 7.5, 9);
  
  // Excited: trapezoid (8.5, 9.5, 10, 10)
  const excited = trapezoidal(x, 8.5, 9.5, 10, 10);
  
  return { depressed, sad, neutral, happy, excited };
};

// Energy membership functions
const getEnergyMembership = (value) => {
  // Scale input from 0-100 to 0-10
  const x = scaleInput(value);
  
  // Energy membership functions with new values
  // Low: trapezoid (0, 0, 2, 4)
  const low = trapezoidal(x, 0, 0, 2, 4);
  
  // Medium: triangle (3, 5, 7)
  const medium = triangular(x, 3, 5, 7);
  
  // High: trapezoid (6, 8, 10, 10)
  const high = trapezoidal(x, 6, 8, 10, 10);
  
  return { low, medium, high };
};

// Vibe membership functions
const getVibeMembership = (value) => {
  // Scale input from 0-100 to 0-10
  const x = scaleInput(value);
  
  // Vibe membership functions with new values
  // Chill: triangle (0, 2, 4)
  const chill = triangular(x, 0, 2, 4);
  
  // Romantic: triangle (3, 4.5, 6)
  const romantic = triangular(x, 3, 4.5, 6);
  
  // Focus: triangle (5, 6.5, 8)
  const focus = triangular(x, 5, 6.5, 8);
  
  // Nostalgic: triangle (6, 7.5, 9)
  const nostalgic = triangular(x, 6, 7.5, 9);
  
  // Party: trapezoid (8, 9, 10, 10)
  const party = trapezoidal(x, 8, 9, 10, 10);
  
  return { chill, romantic, focus, nostalgic, party };
};

// Output fuzzy sets (music genres)
const genres = {
  classical: "Classical",
  jazz: "Jazz",
  acoustic: "Acoustic",
  pop: "Pop",
  rock: "Rock",
  electronic: "Electronic",
  metal: "Metal",
  hiphop: "Hip Hop"
};

// Fuzzy inference rules
const applyFuzzyRules = (mood, energy, vibe) => {
  const rules = [
    // Format: [mood, energy, vibe, genre, weight]
    // Depressed mood rules
    ["depressed", "low", "chill", "classical", 0.9],
    ["depressed", "low", "romantic", "jazz", 0.7],
    ["depressed", "medium", "chill", "acoustic", 0.8],
    ["depressed", "medium", "nostalgic", "acoustic", 0.9],
    ["depressed", "high", "focus", "classical", 0.6],
    
    // Sad mood rules
    ["sad", "low", "chill", "classical", 0.9],
    ["sad", "low", "romantic", "jazz", 0.8],
    ["sad", "low", "nostalgic", "acoustic", 0.9],
    ["sad", "medium", "chill", "acoustic", 0.7],
    ["sad", "medium", "focus", "jazz", 0.6],
    ["sad", "high", "focus", "rock", 0.5],
    ["sad", "high", "party", "metal", 0.7],
    
    // Neutral mood rules
    ["neutral", "low", "chill", "acoustic", 0.8],
    ["neutral", "low", "romantic", "jazz", 0.9],
    ["neutral", "low", "nostalgic", "acoustic", 0.7],
    ["neutral", "medium", "chill", "pop", 0.8],
    ["neutral", "medium", "focus", "pop", 0.9],
    ["neutral", "medium", "nostalgic", "rock", 0.7],
    ["neutral", "high", "focus", "electronic", 0.8],
    ["neutral", "high", "party", "rock", 0.8],
    
    // Happy mood rules
    ["happy", "low", "chill", "acoustic", 0.7],
    ["happy", "low", "romantic", "pop", 0.8],
    ["happy", "medium", "chill", "pop", 0.9],
    ["happy", "medium", "focus", "electronic", 0.8],
    ["happy", "medium", "nostalgic", "pop", 0.9],
    ["happy", "high", "focus", "electronic", 0.9],
    ["happy", "high", "party", "hiphop", 0.9],
    
    // Excited mood rules
    ["excited", "low", "romantic", "pop", 0.7],
    ["excited", "medium", "focus", "electronic", 0.8],
    ["excited", "medium", "party", "hiphop", 0.9],
    ["excited", "high", "focus", "electronic", 0.8],
    ["excited", "high", "party", "hiphop", 1.0]
  ];
  
  // Calculate rule strengths
  const ruleStrengths = {};
  
  rules.forEach(rule => {
    const [moodType, energyType, vibeType, genre, weight] = rule;
    
    // Get membership values for each input
    const moodValue = mood[moodType];
    const energyValue = energy[energyType];
    const vibeValue = vibe[vibeType];
    
    // Calculate rule strength (using minimum operator for AND)
    const strength = Math.min(moodValue, energyValue, vibeValue) * weight;
    
    // Accumulate strengths for each genre (using maximum operator for OR)
    if (!ruleStrengths[genre] || strength > ruleStrengths[genre]) {
      ruleStrengths[genre] = strength;
    }
  });
  
  return ruleStrengths;
};

// Defuzzification - convert fuzzy outputs to crisp recommendations
const defuzzify = (ruleStrengths) => {
  // Sort genres by strength
  const sortedGenres = Object.entries(ruleStrengths)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, strength]) => ({
      genre: genres[genre] || genre,
      strength: Math.round(strength * 100)
    }));
  
  return sortedGenres;
};

// Main function to process inputs and get recommendations
window.getFuzzyRecommendations = (moodValue, energyValue, vibeValue) => {
  // Get membership values
  const mood = getMoodMembership(moodValue);
  const energy = getEnergyMembership(energyValue);
  const vibe = getVibeMembership(vibeValue);
  
  // Apply fuzzy rules
  const ruleStrengths = applyFuzzyRules(mood, energy, vibe);
  
  // Defuzzify to get recommendations
  const recommendations = defuzzify(ruleStrengths);
  
  return recommendations;
};

// Get descriptive mood state based on slider values
window.getMoodState = (mood, energy, vibe) => {
  const moodMembership = getMoodMembership(mood);
  const energyMembership = getEnergyMembership(energy);
  const vibeMembership = getVibeMembership(vibe);
  
  // Find dominant mood, energy, and vibe
  const dominantMood = Object.entries(moodMembership).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const dominantEnergy = Object.entries(energyMembership).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const dominantVibe = Object.entries(vibeMembership).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  // Get membership values for display
  const moodValue = moodMembership[dominantMood].toFixed(2);
  const energyValue = energyMembership[dominantEnergy].toFixed(2);
  const vibeValue = vibeMembership[dominantVibe].toFixed(2);
  
  return {
    mood: dominantMood,
    energy: dominantEnergy,
    vibe: dominantVibe,
    moodValue,
    energyValue,
    vibeValue,
    description: `${dominantMood} mood (${moodValue}) with ${dominantEnergy} energy (${energyValue}) and ${dominantVibe} vibe (${vibeValue})`
  };
};
