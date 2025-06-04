import React, { useState } from 'react';
import { useMusic } from '../contexts/MusicContext';
import './MusicControls.css';

const MusicControls = () => {
  const { isPlaying, volume, isMuted, toggleMusic, changeVolume, toggleMute } = useMusic();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`music-controls ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button 
        className="toggle-expand"
        onClick={toggleExpand}
        title={isExpanded ? 'Hide Music Controls' : 'Show Music Controls'}
      >
        {isExpanded ? '🎵' : '🎵'}
      </button>
      
      {isExpanded && (
        <>
          <button 
            className={`music-toggle ${isPlaying ? 'playing' : 'paused'}`}
            onClick={toggleMusic}
            title={isPlaying ? 'Pause Music' : 'Play Music'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <button 
            className={`mute-toggle ${isMuted ? 'muted' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            className="volume-slider"
            title="Volume"
          />
        </>
      )}
    </div>
  );
};

export default MusicControls;