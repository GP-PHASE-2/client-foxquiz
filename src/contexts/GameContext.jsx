// Hapus ekspor useGame dari file ini
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

export const GameContext = createContext(); // Export context untuk digunakan di useGame.js

// Tidak lagi mengekspor useGame di sini

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    // Check if we already have a socket connection
    if (socket) {
      console.log('Socket already exists, not creating a new one');
      return;
    }

    console.log('Creating new socket connection');
    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'https://gp-phase2.rahmadamri.site', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });
    
    setSocket(newSocket);
    
    // Add reconnection events
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
    });
    
    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
      setError('Connection lost. Attempting to reconnect...');
    });
    
    newSocket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      setError('Connection lost. Please refresh the page.');
    });
    
    // Add this to your socket initialization
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Connection error. Please refresh the page.');
    });
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setError(null);
      
      // If we were in a room before, try to rejoin
      if (room?.id) {
        console.log('Attempting to rejoin room after reconnection');
        newSocket.emit('rejoin_room', {
          roomId: room.id,
          playerId: player?.id
        });
      }
    });
    
    newSocket.on('error', (data) => {
      console.log('Socket error received:', data);
      setError(data.message);
    });

    newSocket.on('room_joined', (data) => {
      setRoom(data.room);
      setPlayers(data.players);
      setPlayer(data.players.find(p => p.id === data.playerId));
      // Add navigation to lobby page
      navigate(`/lobby/${data.room.code}`);
    });

    newSocket.on('room_update', (data) => {
      if (data.room) setRoom(data.room);
      if (data.players) setPlayers(data.players);
    });

    newSocket.on('game_starting', (data) => {
      console.log('Game starting event received:', data);
      setGameState('playing');
      // Use room code from the event data
      const roomCode = data.room?.code || room?.code;
      console.log('Navigating to game page:', `/game/${roomCode}`);
      navigate(`/game/${roomCode}`);
    });

    newSocket.on('new_question', (data) => {
      setCurrentQuestion(data);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(10);
      setSelectedAnswer(null);
      setAnswerResult(null);
    });

    newSocket.on('answer_reveal', (data) => {
      setAnswerResult(data);
      setPlayers(data.updatedPlayers);
    });

    newSocket.on('game_ended', (data) => {
      console.log('Game ended event received:', data);
      setGameState('finished');
      
      if (data.leaderboard && data.leaderboard.length > 0) {
        console.log('Setting players from leaderboard:', data.leaderboard);
        setPlayers(data.leaderboard);
        
        // Update the current player from the leaderboard
        const currentPlayer = data.leaderboard.find(p => p.id === socket?.id);
        if (currentPlayer) {
          setPlayer(currentPlayer);
          console.log('Updated current player:', currentPlayer);
        } else {
          console.error('Current player not found in leaderboard');
        }
        
        // Navigate after a small delay to ensure state is updated
        setTimeout(() => {
          const roomCode = data.roomCode || room?.code;
          if (roomCode) {
            console.log('Navigating to results page:', `/results/${roomCode}`);
            navigate(`/results/${roomCode}`);
          } else {
            console.error('No room code available for navigation');
          }
        }, 100);
      } else {
        console.error('No leaderboard data received');
      }
    });

    newSocket.on('game_reset', (data) => {
      setRoom(data.room);
      setPlayers(data.players);
      setGameState('waiting');
      setChatMessages([]);
      // Safe navigation with null check
      const roomCode = data.room?.code;
      if (roomCode) {
        navigate(`/lobby/${roomCode}`);
      } else {
        console.error('No room code available for game reset navigation');
        navigate('/'); // Fallback to home page
      }
    });

    newSocket.on('chat_message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
      setSocket(null);
    };
  }, []); // Empty dependency array to run only once

  // Timer effect for questions
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && currentQuestion && timeLeft > 0 && !selectedAnswer && !answerResult) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Submit null answer when time runs out, but only if no answer selected yet
            if (!selectedAnswer && !answerResult) {
              submitAnswer(null);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [gameState, currentQuestion, timeLeft, selectedAnswer, answerResult]);

  // Join or create room
  const joinRoom = (username, avatar, roomCode = null) => {
    if (!socket) return;
    
    const isHost = !roomCode;
    socket.emit('join_room', { username, avatar, roomCode, isHost });
  };

  // Start game (host only)
  const startGame = (settings) => {
    if (!socket || !room) {
      console.log('Cannot start game - missing socket or room:', { socket: !!socket, room: !!room });
      return;
    }
    
    console.log('Starting game with settings:', { roomId: room.id, ...settings });
    socket.emit('start_game', {
      roomId: room.id,
      ...settings
    });
  };

  // Submit answer
  const submitAnswer = (answer) => {
    if (!socket || !room || !currentQuestion) return;
    
    setSelectedAnswer(answer);
    
    socket.emit('submit_answer', {
      roomId: room.id,
      answer,
      answerTime: (10 - timeLeft) * 1000 // Convert to milliseconds
    });
  };

  // Send chat message
  const sendChatMessage = (message) => {
    if (!socket || !room) return;
    
    console.log('Sending chat message:', { roomId: room.id, message }); // Add this
    socket.emit('chat_message', {
      roomId: room.id,
      message
    });
  };

  // Play again (host only)
  const playAgain = () => {
    if (!socket || !room) {
      console.error('Cannot play again - missing socket or room');
      setError('Connection error. Please refresh the page.');
      return;
    }
    
    socket.emit('play_again', {
      roomId: room.id
    });
  };

  // Clear error
  const clearError = () => setError(null);

  // Add this new function to reset the game state
  const resetGameState = () => {
    setPlayer(null);
    setRoom(null);
    setPlayers([]);
    setGameState('waiting');
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setTotalQuestions(0);
    setTimeLeft(10);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setChatMessages([]);
    setError(null);
  };
  
  // Add a new function to handle returning to home
  const returnToHome = () => {
    resetGameState();
    navigate('/');
  };
  
  // Modify the value object to include the new function
  const value = {
    socket,
    player,
    room,
    players,
    gameState,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    selectedAnswer,
    answerResult,
    chatMessages,
    error,
    joinRoom,
    startGame,
    submitAnswer,
    sendChatMessage,
    playAgain,
    clearError,
    returnToHome  // Add this new function to the context
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};