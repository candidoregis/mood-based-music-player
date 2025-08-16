import { useState, useEffect } from 'react';
import './App.css';
import { getFuzzyRecommendations, getMoodState } from './fuzzyLogic';

function App() {
  const [mood, setMood] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [vibe, setVibe] = useState(50);
  const [recommendations, setRecommendations] = useState([]);
  const [moodState, setMoodState] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Update recommendations when sliders change
  useEffect(() => {
    const newRecommendations = getFuzzyRecommendations(mood, energy, vibe);
    const newMoodState = getMoodState(mood, energy, vibe);
    setRecommendations(newRecommendations);
    setMoodState(newMoodState);
  }, [mood, energy, vibe]);

  const handleMoodChange = (e) => {
    setMood(e.target.value);
  };

  const handleEnergyChange = (e) => {
    setEnergy(e.target.value);
  };

  const handleVibeChange = (e) => {
    setVibe(e.target.value);
  };

  const handleFindMusic = () => {
    setShowResults(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mood-Based Music Player</h1>
        <div className="slider-container">
          <div className="slider-group">
            <label htmlFor="mood">Mood: {mood}%</label>
            <input
              type="range"
              id="mood"
              name="mood"
              min="0"
              max="100"
              value={mood}
              onChange={handleMoodChange}
              className="slider"
            />
            <span className="slider-labels">
              <span>Sad</span>
              <span>Happy</span>
            </span>
          </div>

          <div className="slider-group">
            <label htmlFor="energy">Energy: {energy}%</label>
            <input
              type="range"
              id="energy"
              name="energy"
              min="0"
              max="100"
              value={energy}
              onChange={handleEnergyChange}
              className="slider"
            />
            <span className="slider-labels">
              <span>Low</span>
              <span>High</span>
            </span>
          </div>

          <div className="slider-group">
            <label htmlFor="vibe">Vibe: {vibe}%</label>
            <input
              type="range"
              id="vibe"
              name="vibe"
              min="0"
              max="100"
              value={vibe}
              onChange={handleVibeChange}
              className="slider"
            />
            <span className="slider-labels">
              <span>Chill</span>
              <span>Intense</span>
            </span>
          </div>
        </div>
        
        <button className="find-music-btn" onClick={handleFindMusic}>
          Find Music
        </button>

        {showResults && (
          <div className="results-container">
            <div className="mood-analysis">
              <h2>Your Mood Analysis</h2>
              <p className="mood-description">{moodState.description}</p>
            </div>
            
            <div className="recommendations">
              <h2>Recommended Genres</h2>
              <ul className="genre-list">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="genre-item">
                    <span className="genre-name">{rec.genre}</span>
                    <div className="strength-bar-container">
                      <div 
                        className="strength-bar" 
                        style={{ width: `${rec.strength}%` }}
                      ></div>
                    </div>
                    <span className="strength-value">{rec.strength}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
