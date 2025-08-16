import { useState } from 'react';
import './App.css';

function App() {
  const [mood, setMood] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [vibe, setVibe] = useState(50);

  const handleMoodChange = (e) => {
    setMood(e.target.value);
  };

  const handleEnergyChange = (e) => {
    setEnergy(e.target.value);
  };

  const handleVibeChange = (e) => {
    setVibe(e.target.value);
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
        
        <button className="find-music-btn">
          Find Music
        </button>
      </header>
    </div>
  );
}

export default App;
