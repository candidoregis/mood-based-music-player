/**
 * Fuzzy Logic System for Mood-Based Music Player
 * This module implements a simple fuzzy logic system to provide music recommendations
 * based on mood, energy, and vibe inputs.
 */

// Membership functions for fuzzy sets

// Mood membership functions (Sad to Happy)
const getMoodMembership = (value) => {
  const sad = value <= 25 ? 1 : value <= 50 ? (50 - value) / 25 : 0;
  const neutral = value <= 25 ? value / 25 : value <= 75 ? (75 - value) / 50 : 0;
  const happy = value <= 50 ? 0 : value <= 75 ? (value - 50) / 25 : 1;
  
  return { sad, neutral, happy };
};

// Energy membership functions (Low to High)
const getEnergyMembership = (value) => {
  const low = value <= 30 ? 1 : value <= 60 ? (60 - value) / 30 : 0;
  const medium = value <= 30 ? value / 30 : value <= 70 ? (70 - value) / 40 : 0;
  const high = value <= 40 ? 0 : value <= 70 ? (value - 40) / 30 : 1;
  
  return { low, medium, high };
};

// Vibe membership functions (Chill to Intense)
const getVibeMembership = (value) => {
  const chill = value <= 30 ? 1 : value <= 60 ? (60 - value) / 30 : 0;
  const moderate = value <= 30 ? value / 30 : value <= 70 ? (70 - value) / 40 : 0;
  const intense = value <= 40 ? 0 : value <= 70 ? (value - 40) / 30 : 1;
  
  return { chill, moderate, intense };
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
    ["sad", "low", "chill", "classical", 0.9],
    ["sad", "low", "moderate", "jazz", 0.8],
    ["sad", "medium", "chill", "acoustic", 0.7],
    ["sad", "medium", "moderate", "jazz", 0.6],
    ["sad", "high", "moderate", "rock", 0.5],
    ["sad", "high", "intense", "metal", 0.7],
    
    ["neutral", "low", "chill", "acoustic", 0.8],
    ["neutral", "low", "moderate", "jazz", 0.7],
    ["neutral", "medium", "chill", "pop", 0.8],
    ["neutral", "medium", "moderate", "pop", 0.9],
    ["neutral", "medium", "intense", "rock", 0.7],
    ["neutral", "high", "moderate", "electronic", 0.8],
    ["neutral", "high", "intense", "rock", 0.8],
    
    ["happy", "low", "chill", "acoustic", 0.7],
    ["happy", "low", "moderate", "pop", 0.8],
    ["happy", "medium", "chill", "pop", 0.9],
    ["happy", "medium", "moderate", "electronic", 0.8],
    ["happy", "high", "moderate", "electronic", 0.9],
    ["happy", "high", "intense", "hiphop", 0.9]
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
export const getFuzzyRecommendations = (moodValue, energyValue, vibeValue) => {
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
export const getMoodState = (mood, energy, vibe) => {
  const moodMembership = getMoodMembership(mood);
  const energyMembership = getEnergyMembership(energy);
  const vibeMembership = getVibeMembership(vibe);
  
  // Find dominant mood, energy, and vibe
  const dominantMood = Object.entries(moodMembership).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const dominantEnergy = Object.entries(energyMembership).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const dominantVibe = Object.entries(vibeMembership).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  return {
    mood: dominantMood,
    energy: dominantEnergy,
    vibe: dominantVibe,
    description: `${dominantMood} mood with ${dominantEnergy} energy and ${dominantVibe} vibe`
  };
};
