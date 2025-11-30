import React, { useState } from 'react';
import { GameState } from './types';
import GameCanvas from './components/GameCanvas';
import { CarrotSVG, RabbitSVG } from './components/Assets';
import { Play, RotateCcw } from 'lucide-react';
import { playSound } from './utils/sound';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [finalScore, setFinalScore] = useState(0);

  const startGame = () => {
    playSound('jump');
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    playSound('win');
    setGameState(GameState.GAME_OVER);
  };

  const exitGame = () => {
    setGameState(GameState.MENU);
  };

  return (
    <div className="w-screen h-screen bg-blue-100 flex items-center justify-center font-sans text-gray-800 select-none">
      
      {/* Start Screen */}
      {gameState === GameState.MENU && (
        <div className="flex flex-col items-center animate-fade-in p-6 text-center max-w-sm w-full">
          <div className="w-40 h-40 mb-6 animate-bounce-slow">
             <RabbitSVG isHit={false} />
          </div>
          <h1 className="text-4xl font-extrabold text-green-600 mb-2 drop-shadow-sm tracking-tight">
            Little Bunny Hop
          </h1>
          <p className="text-lg text-blue-600 mb-8 font-medium">
            Collect carrots! Avoid rocks!
          </p>
          
          <button 
            onClick={startGame}
            className="group relative w-full bg-orange-400 hover:bg-orange-500 text-white text-2xl font-bold py-6 px-12 rounded-3xl shadow-[0_6px_0_rgb(194,65,12)] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-4"
          >
            <Play className="w-8 h-8 fill-current" />
            <span>PLAY</span>
            <div className="absolute -top-3 -right-3 w-10 h-10 rotate-12">
              <CarrotSVG />
            </div>
          </button>
        </div>
      )}

      {/* Game Loop */}
      {gameState === GameState.PLAYING && (
        <GameCanvas onGameOver={handleGameOver} onExit={exitGame} />
      )}

      {/* Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <div className="flex flex-col items-center animate-fade-in p-8 text-center bg-white/90 rounded-3xl shadow-2xl border-4 border-orange-200 max-w-sm mx-4">
          <h2 className="text-3xl font-bold text-gray-700 mb-2">Good Job!</h2>
          
          <div className="flex flex-col items-center justify-center my-6 p-6 bg-orange-50 rounded-2xl w-full">
            <span className="text-gray-500 text-lg uppercase tracking-widest font-bold mb-2">Score</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10"><CarrotSVG /></div>
              <span className="text-6xl font-black text-orange-500">{finalScore}</span>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button 
              onClick={exitGame}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-4 rounded-xl transition-colors"
            >
              Menu
            </button>
            <button 
              onClick={startGame}
              className="flex-[2] bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* Global CSS for custom bounce animation */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default App;