import React, { useState, useCallback } from 'react';
import { GameState, GameStats, Question, MAX_LIVES, TOTAL_QUESTIONS, GameMode } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import StatsScreen from './components/StatsScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.CLASSIC_12);
  
  const [stats, setStats] = useState<GameStats>({
    mode: GameMode.CLASSIC_12,
    score: 0,
    totalQuestions: TOTAL_QUESTIONS,
    lives: MAX_LIVES,
    history: []
  });

  const startGame = useCallback((selectedMode: GameMode) => {
    setGameMode(selectedMode);
    setStats({
      mode: selectedMode,
      score: 0,
      totalQuestions: TOTAL_QUESTIONS,
      lives: MAX_LIVES,
      history: []
    });
    setGameState(GameState.PLAYING);
  }, []);

  const handleGameEnd = useCallback((finalHistory: Question[], livesLeft: number) => {
    // Calculate final score based on correct answers in history
    const correctCount = finalHistory.filter(q => q.isCorrect).length;
    
    setStats(prev => ({
      ...prev,
      history: finalHistory,
      score: correctCount,
      lives: livesLeft
    }));
    setGameState(GameState.FINISHED);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(GameState.WELCOME);
  }, []);

  const isPlaying = gameState === GameState.PLAYING;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isPlaying ? 'p-0 overflow-hidden' : 'p-4'} selection:bg-gray-200`}>
      <main className={`w-full max-w-3xl flex flex-col items-center justify-center flex-grow transition-all duration-500 ${isPlaying ? 'h-[100dvh] pt-6 pb-2' : 'pt-10 pb-10'}`}>
        {gameState === GameState.WELCOME && (
          <WelcomeScreen onStart={startGame} />
        )}
        {gameState === GameState.PLAYING && (
          <GameScreen 
            mode={gameMode}
            onGameEnd={handleGameEnd} 
            maxLives={MAX_LIVES}
            totalQuestions={TOTAL_QUESTIONS}
          />
        )}
        {gameState === GameState.FINISHED && (
          <StatsScreen 
            stats={stats} 
            onRestart={resetGame} 
          />
        )}
      </main>

      {!isPlaying && (
        <footer className="fixed bottom-0 w-full py-4 text-center text-xs text-gray-400 bg-white/90 backdrop-blur-md border-t border-gray-100">
          <p>© {new Date().getFullYear()} Adrien Bardon.</p>
        </footer>
      )}
    </div>
  );
};

export default App;