import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/useGame';
import axios from 'axios';
import '../styles/HomePage.css';

const HomePage = () => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinMode, setJoinMode] = useState('create'); // 'create' or 'join'
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { joinRoom, error: contextError, clearError } = useGame();
//   const navigate = useNavigate();

  // Fetch available avatars
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL || 'https://quiz.diotaufiq.site'}/api/avatars`);
        setAvailableAvatars(response.data);
        if (response.data.length > 0) {
          setSelectedAvatar(response.data[0]);
        }      } catch (err) {
        console.error('Error fetching avatars:', err);
        // Fallback avatars if API fails
        const fallbackAvatars = [
          '/avatar1.svg',
          '/avatar2.svg',
          '/avatar3.svg',
          '/avatar4.svg',
          '/avatar5.svg',
          '/avatar6.svg'
        ];
        setAvailableAvatars(fallbackAvatars);
        setSelectedAvatar(fallbackAvatars[0]);
      }
    };

    fetchAvatars();
    
    // Clear any previous errors
    clearError();
  }, [clearError]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!selectedAvatar) {
      setError('Please select an avatar');
      return;
    }
    
    if (joinMode === 'join' && !roomCode.trim()) {
      setError('Room code is required to join a game');
      return;
    }
    
    setIsLoading(true);
    
    // Use the joinRoom function from GameContext
    joinRoom(
      username,
      selectedAvatar,
      joinMode === 'join' ? roomCode : null
    );
    
    // Navigation will be handled by the socket event listeners in GameContext
  };

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  // Display error from context or local state
  const displayError = error || contextError;

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="game-title">Quiz Battle</h1>
        <p className="game-subtitle">Test your knowledge in this multiplayer quiz game!</p>
        
        <div className="mode-selector">
          <button 
            className={`mode-btn ${joinMode === 'create' ? 'active' : ''}`}
            onClick={() => setJoinMode('create')}
          >
            Create Room
          </button>
          <button 
            className={`mode-btn ${joinMode === 'join' ? 'active' : ''}`}
            onClick={() => setJoinMode('join')}
          >
            Join Room
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label htmlFor="username">Your Nickname</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your nickname"
              maxLength="15"
              required
            />
          </div>
          
          {joinMode === 'join' && (
            <div className="form-group">
              <label htmlFor="roomCode">Room Code</label>
              <input
                type="text"
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength="6"
              />
            </div>
          )}
            <div className="form-group">
            <label>Select Your Avatar</label>
            <div className="avatar-grid">              {availableAvatars.map((avatar, index) => (
                <div 
                  key={index}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <img 
                    src={avatar} 
                    alt={`Avatar ${index + 1}`} 
                    onError={(e) => {
                      e.target.onerror = null;
                      // Fallback ke avatar lokal jika gagal
                      const fallbackAvatars = ['/avatar1.svg', '/avatar2.svg', '/avatar3.svg', '/avatar4.svg', '/avatar5.svg', '/avatar6.svg'];
                      const randomIndex = Math.floor(Math.random() * fallbackAvatars.length);
                      e.target.src = fallbackAvatars[randomIndex];
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {displayError && (
            <div className="error-message">{displayError}</div>
          )}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : joinMode === 'create' ? 'Create Game' : 'Join Game'}
          </button>
          
          <button 
            type="button"
            className="refresh-btn"
            onClick={handleRefresh}
          >
            <span role="img" aria-label="refresh">🔄</span> Refresh
          </button>
        </form>
      </div>
      
      <footer className="home-footer">
        <p>Powered by AI - Created by Tim DOA IBU Students of HCK-83 </p>
      </footer>
    </div>
  );
};

export default HomePage;
// Remove this duplicate useEffect at the end of the file
// // If you want to keep this effect, modify it to run only once
// useEffect(() => {
//   setUsername('');
//   setSelectedAvatar('');
//   setRoomCode('');
//   setError('');
//   setIsLoading(false);
  
//   // Clear any previous errors from context
//   clearError();
// }, []); // Empty dependency array means it runs only once when component mounts