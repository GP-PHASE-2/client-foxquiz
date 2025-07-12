import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/useGame';
import '../styles/LobbyPage.css';

const LobbyPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { 
    room, 
    player, 
    players, 
    startGame, 
    sendChatMessage,
    chatMessages,
    error: contextError 
  } = useGame();

  const [chatMessage, setChatMessage] = useState('');
  const [gameSettings, setGameSettings] = useState({
    category: 'mixed',
    difficulty: 'medium',
    totalQuestions: 5
  });
  const [error, setError] = useState('');

  // Redirect if no room data is available
  useEffect(() => {
    if (!room && !contextError) {
      navigate('/');
    }
  }, [room, contextError, navigate]);

  // Handle game start
  const handleStartGame = () => {
    console.log('Start game button clicked');
    console.log('Player:', player);
    console.log('Players count:', players.length);
    
    if (!player?.isHost) {
      setError('Only the host can start the game');
      return;
    }
  
    if (players.length < 2) {
      setError('Need at least 2 players to start');
      return;
    }
  
    console.log('Calling startGame with settings:', gameSettings);
    startGame(gameSettings);
  };

  // Handle chat submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    sendChatMessage(chatMessage);
    setChatMessage('');
  };

  // Copy room code to clipboard
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    // You could add a visual feedback here
  };

  if (!room) {
    return (
      <div className="lobby-container">
        <div className="loading-message">
          {contextError ? (
            <>
              <h2>Error</h2>
              <p>{contextError}</p>
              <button onClick={() => navigate('/')}>Back to Home</button>
            </>
          ) : (
            <p>Loading lobby...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-content-wrapper">
        <div className="lobby-card">
          <div className="lobby-header">
            <h1>Game Lobby</h1>
            <div className="room-code">
              <span>Room Code: <strong>{roomCode}</strong></span>
              <button className="copy-btn" onClick={copyRoomCode} title="Copy to clipboard">
                📋
              </button>
            </div>
          </div>

          <div className="lobby-inner-content">
            <div className="players-section">
              <h2>Players ({players.length})</h2>
              <div className="players-list">                {players.map((p) => (                  <div key={p.id} className="player-card">
                    <div className="player-avatar">
                      <img 
                        src={p.avatar || '/avatar1.svg'} 
                        alt={`${p.username}'s avatar`} 
                        onError={(e) => {
                          e.target.onerror = null;
                          // Fallback ke avatar lokal jika gagal
                          const fallbackAvatars = ['/avatar1.svg', '/avatar2.svg', '/avatar3.svg', '/avatar4.svg', '/avatar5.svg', '/avatar6.svg'];
                          const randomIndex = Math.floor(Math.random() * fallbackAvatars.length);
                          e.target.src = fallbackAvatars[randomIndex];
                        }}
                      />
                    </div>
                    <span className="player-name" style={{color:'yellow'}}>{p.username} {p.isHost && '👑'}</span>
                  </div>
                ))}
              </div>
            </div>

            {player?.isHost && (
              <div className="game-settings">
                <h2>Game Settings</h2>
                <div className="settings-form">
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select 
                      id="category" 
                      value={gameSettings.category}
                      onChange={(e) => setGameSettings({...gameSettings, category: e.target.value})}
                    >
                      <option value="mixed">Mixed</option>
                      <option value="science">Science</option>
                      <option value="history">History</option>
                      <option value="geography">Geography</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="fullstack-javascript">Fullstack JavaScript</option>
                      <option value="backend">Backend (Express + Sequelize)</option>
                      <option value="frontend">Frontend (Vite + React)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="difficulty">Difficulty</label>
                    <select 
                      id="difficulty" 
                      value={gameSettings.difficulty}
                      onChange={(e) => setGameSettings({...gameSettings, difficulty: e.target.value})}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="totalQuestions">Number of Questions</label>
                    <select 
                      id="totalQuestions" 
                      value={gameSettings.totalQuestions}
                      onChange={(e) => setGameSettings({...gameSettings, totalQuestions: parseInt(e.target.value)})}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="chat-section">
              <h2>Chat</h2>
              <div className="chat-messages">
                {chatMessages && chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.playerId === player?.id ? 'own-message' : ''}`}>
                    <span className="message-sender">{msg.username}:</span>
                    <span className="message-text">{msg.message}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="chat-form">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  maxLength="100"
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="lobby-footer">
            {player?.isHost ? (
              <button 
                className="start-game-btn" 
                onClick={handleStartGame}
                disabled={players.length < 2}
              >
                Start Game
              </button>
            ) : (
              <p className="waiting-message">Waiting for host to start the game...</p>
            )}
            <button className="leave-btn" onClick={() => navigate('/')}>Leave Game</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;