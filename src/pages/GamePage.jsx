import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/useGame'; // Ubah import ini
import '../styles/GamePage.css'; // You'll need to create this CSS file

const GamePage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const {
    room,
    player,
    players,
    gameState,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    selectedAnswer,
    answerResult,
    submitAnswer
  } = useGame();

  // Redirect if no room data or not in playing state
  useEffect(() => {
    if (!room || gameState !== 'playing') {
      navigate('/');
    }
  }, [room, gameState, navigate]);

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    submitAnswer(answer);
  };

  if (!room || !currentQuestion) {
    return (
      <div className="game-container">
        <div className="loading-message">
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // Inside the return statement, wrap the content in a game-card div
  return (
    <div className="game-container">
      <div className="game-card">
        <div className="game-header">
          <div className="question-progress">
            <span>Question {questionNumber} of {totalQuestions}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="timer">
            <div className="timer-circle">
              <svg viewBox="0 0 36 36">
                <path
                  className="timer-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="timer-fill"
                  strokeDasharray={`${(timeLeft / 10) * 100}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="timer-text">{timeLeft}</span>
            </div>
          </div>
        </div>

        <div className="question-container">
        <h2 className="question-text">{currentQuestion.question}</h2>
        
        {/* Add answer result notification */}
        {answerResult && (
          <div className={`answer-notification ${selectedAnswer === answerResult.correctAnswer ? 'correct' : 'incorrect'}`}>
            {selectedAnswer === answerResult.correctAnswer 
              ? '✓ Jawaban Benar!' 
              : `✗ Jawaban Salah! Jawaban yang benar adalah ${answerResult.correctAnswer}.`}
            {answerResult.explanation && (
              <p className="answer-explanation">{answerResult.explanation}</p>
            )}
          </div>
        )}
        
        {/* Safety check for options */}
        {!currentQuestion || !currentQuestion.options ? (
          <div>Loading question...</div>
        ) : (
          <div className="answers-grid">
            {Array.isArray(currentQuestion.options) 
              ? currentQuestion.options.map((option) => {
                  let answerClass = "answer-option";
                  
                  if (answerResult) {
                    // Fix: Use answerResult.correctAnswer instead of currentQuestion.correctAnswer
                    if (option.key === answerResult.correctAnswer) {
                      answerClass += " correct";
                    } else if (selectedAnswer === option.key) {
                      answerClass += " incorrect";
                    }
                  } else if (selectedAnswer === option.key) {
                    answerClass += " selected";
                  }
                  
                  return (
                    <button
                      key={option.key}
                      className={answerClass}
                      onClick={() => handleAnswerSelect(option.key)}
                      disabled={!!answerResult}
                    >
                      <span className="option-letter">{option.key}.</span>
                      <span className="option-text">{option.text}</span>
                    </button>
                  );
                })
              : Object.entries(currentQuestion.options).map(([key, value], index) => {
                  let answerClass = "answer-option";
                  
                  if (answerResult) {
                    // Fix: Use answerResult.correctAnswer instead of currentQuestion.correctAnswer
                    if (key === answerResult.correctAnswer) {
                      answerClass += " correct";
                    } else if (selectedAnswer === key) {
                      answerClass += " incorrect";
                    }
                  } else if (selectedAnswer === key) {
                    answerClass += " selected";
                  }
                  
                  return (
                    <button
                      key={key}
                      className={answerClass}
                      onClick={() => handleAnswerSelect(key)}
                      disabled={!!answerResult}
                    >
                      <span className="option-letter">{key}.</span>
                      <span className="option-text">{value}</span>
                    </button>
                  );
                })
            }
          </div>
        )}
      </div>

      <div className="game-footer">
        <div className="players-scores">
          {players.map((p) => (
            <div key={p.id} className="player-score">
              {/* Add error handling and fallback for avatar */}
              <img 
                src={p.avatar || `https://api.dicebear.com/6.x/bottts/svg?seed=${p.username}`} 
                alt={`${p.username}'s avatar`} 
                className="player-avatar" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/6.x/bottts/svg?seed=${p.username}`;
                }}
              />
              <span className="player-name" style={{color:'yellow'}}>{p.username}</span>
              <span className="player-points">{p.score || 0} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
}

export default GamePage;