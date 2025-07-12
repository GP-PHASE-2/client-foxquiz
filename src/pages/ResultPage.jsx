import React, { useEffect } from 'react'; // Add React and useEffect import
import {  useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/useGame';
import '../styles/ResultPage.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const {
    room,
    player,
    players,
    gameState,
    playAgain,
    returnToHome,
    socket
  } = useGame();

  // Fallback: if player is undefined, find it from players array
  const currentPlayer = player || (players && socket ? players.find(p => p.id === socket.id) : null);
  
  // Add debug logs inside the component
  console.log('=== RESULTPAGE DEBUG ===');
  console.log('Current player from context:', player);
  console.log('Socket ID:', socket?.id);
  console.log('All players received:', players);
  console.log('Player found in players array:', players?.find(p => p.id === socket?.id));
  console.log('Is current player host?', currentPlayer?.isHost);
  console.log('Sorted players:', players && players.length > 0 ? [...players].sort((a, b) => b.score - a.score) : []);
  console.log('=== END RESULTPAGE DEBUG ===');
  
  // Use currentPlayer instead of player throughout the component
  const sortedPlayers = players && players.length > 0
    ? [...players].sort((a, b) => b.score - a.score) 
    : [];
  
  // Redirect if no room data or not in finished state
  useEffect(() => {
    console.log('ResultPage - Current room:', room);
    console.log('ResultPage - Current gameState:', gameState);
    console.log('ResultPage - Players data:', players);
    
    // Add a delay before redirecting to allow state to settle
    const redirectTimer = setTimeout(() => {
      if (!room || gameState !== 'finished') {
        console.log('Redirecting to home - missing room or wrong game state');
        navigate('/');
      }
    }, 500);
      return () => clearTimeout(redirectTimer);
  }, [room, gameState, navigate, players]);
  
  // Add handlePlayAgain function
  const handlePlayAgain = () => {
    if (playAgain) {
      playAgain();
    }
  };
  
  // Add loading state
  if (!room || gameState !== 'finished' || sortedPlayers.length === 0) {
    return (
      <div className="results-container">
        <div className="loading-message">
          <p>Loading results...</p>
          <p>Room: {room ? 'Found' : 'Not found'}</p>
          <p>Game State: {gameState}</p>
          <p>Players: {players?.length || 0}</p>
        </div>
      </div>
    );
  }

  // Add this right before the return statement
  console.log('ResultPage render:', {
    room: !!room,
    gameState,
    playersCount: players?.length || 0,
    sortedPlayersCount: sortedPlayers.length,
    players: players
  });

  // Inside the return statement, wrap the content in a results-card div
  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-header">
          <h1>Game Results</h1>
        </div>

        <div className="results-content">
          <div className="winner-section">
            {sortedPlayers.length > 0 && (
              <>
                <div className="winner-crown">👑</div>                <div className="winner-avatar">
                  <img src={sortedPlayers[0].avatar} alt="Winner Avatar" />
                </div>
                <h2 className="winner-name">{sortedPlayers[0].username}</h2>
                <p className="winner-score">{sortedPlayers[0].score} points</p>
              </>
            )}
          </div>

          <div className="leaderboard">
            <h2>Leaderboard</h2>
            <div className="leaderboard-list">
              {sortedPlayers.length > 0 ? (
                sortedPlayers.map((p, index) => (
                  <div 
                    key={p.id} 
                    className={`leaderboard-item ${p.id === currentPlayer?.id ? 'current-player' : ''}`}
                    style={{"--rank": index}}
                  >
                    <div className="rank">{index + 1}</div>                    <div className="player-info">
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
                      <span className="player-name" style={{color:'orange'}}>{p.username}</span>
                    </div>
                    <div className="score">{p.score} pts</div>
                  </div>
                ))
              ) : (
                <div className="no-players-message">Tidak ada data pemain tersedia</div>
              )}
            </div>
          </div>
        </div>

        <div className="results-footer">
          {currentPlayer?.isHost ? (
            <button className="play-again-btn" onClick={handlePlayAgain}>
              Play Again
            </button>
          ) : (
            <p className="waiting-message">Waiting for host to start a new game...</p>
          )}
          <button className="home-btn" onClick={() => {
            console.log('Return to home clicked');
            returnToHome();
          }}>Return to Home</button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;