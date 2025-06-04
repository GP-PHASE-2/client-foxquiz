import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // 30% volume
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    
    // Add error handling
    audioRef.current.onerror = (e) => {
      console.error('Audio loading error:', e);
      console.error('Attempted to load:', audioRef.current.src);
    };
    
    audioRef.current.onloadstart = () => {
      console.log('Audio loading started:', audioRef.current.src);
    };
    
    audioRef.current.oncanplay = () => {
      console.log('Audio can play');
    };
    
    audioRef.current.src = '/David Guetta Hypaton & Europe - The Final Countdown 2025 (Visualizer).mp3'; // Fixed path
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playMusic = async () => {
    try {
      if (audioRef.current && !isPlaying) {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('Audio play failed:', error);
    }
  };

  const pauseMusic = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  return (
    <MusicContext.Provider value={{
      isPlaying,
      volume,
      isMuted,
      playMusic,
      pauseMusic,
      toggleMusic,
      changeVolume,
      toggleMute
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};