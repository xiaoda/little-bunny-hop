
import React, { useState, useEffect } from 'react';
import { GameState, Difficulty } from './types';
import GameCanvas from './components/GameCanvas';
import { CarrotSVG, RabbitSVG } from './components/Assets';
import { Play, RotateCcw, Volume2, VolumeX, Star } from 'lucide-react';
import { playSound, musicManager } from './utils/sound';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [finalScore, setFinalScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');

  // Manage Background Music based on Game State
  useEffect(() => {
    // When mounting, or state changing, try to play appropriate music
    // Note: AudioContext needs user interaction first, handled in startGame or toggleMute
    if (gameState === GameState.PLAYING) {
      musicManager.play('playing');
    } else {
      musicManager.play('menu');
    }

    return () => {
      // Clean up if needed, though manager handles switching logic
    };
  }, [gameState]);

  const toggleMute = () => {
    const muted = musicManager.toggleMute();
    setIsMuted(muted);
    // Ensure context is running if they click this first
    musicManager.init();
  };

  const startGame = () => {
    // Ensure audio context is unlocked
    musicManager.init();
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
    <div className="w-screen h-screen bg-blue-100 flex items-center justify-center font-sans text-gray-800 select-none relative">
      
      {/* Mute Button (Only visible on Menu or Game Over) */}
      {gameState !== GameState.PLAYING && (
        <button 
          onClick={toggleMute}
          className="absolute top-4 right-4 z-50 p-3 bg-white/80 backdrop-blur rounded-full shadow-md text-gray-600 hover:bg-white transition-all"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      )}

      {/* Start Screen */}
      {gameState === GameState.MENU && (
        <div className="flex flex-col items-center animate-fade-in p-6 text-center max-w-sm w-full">
          <div className="w-40 h-40 mb-6 animate-bounce-slow">
             <RabbitSVG isHit={false} />
          </div>
          <h1 className="text-4xl font-extrabold text-green-600 mb-2 drop-shadow-sm tracking-tight">
            Little Bunny Hop
          </h1>
          <p className="text-lg text-blue-600 mb-6 font-medium">
            Collect carrots! Avoid rocks!
          </p>
          
          {/* Difficulty Selector */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            <button 
               onClick={() => setDifficulty('EASY')}
               className={`flex flex-col items-center justify-center p-3 rounded-2xl border-b-4 transition-all ${difficulty === 'EASY' ? 'bg-green-100 border-green-500 text-green-600 scale-105 shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
            >
              <Star className={`w-6 h-6 mb-1 ${difficulty === 'EASY' ? 'fill-current' : ''}`} />
              <span className="font-bold text-sm">EASY</span>
            </button>
            <button 
               onClick={() => setDifficulty('MEDIUM')}
               className={`flex flex-col items-center justify-center p-3 rounded-2xl border-b-4 transition-all ${difficulty === 'MEDIUM' ? 'bg-yellow-100 border-yellow-500 text-yellow-600 scale-105 shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
            >
              <div className="flex gap-0.5">
                <Star className={`w-4 h-4 mb-1 ${difficulty === 'MEDIUM' ? 'fill-current' : ''}`} />
                <Star className={`w-4 h-4 mb-1 ${difficulty === 'MEDIUM' ? 'fill-current' : ''}`} />
              </div>
              <span className="font-bold text-sm">OKAY</span>
            </button>
            <button 
               onClick={() => setDifficulty('HARD')}
               className={`flex flex-col items-center justify-center p-3 rounded-2xl border-b-4 transition-all ${difficulty === 'HARD' ? 'bg-red-100 border-red-500 text-red-600 scale-105 shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
            >
              <div className="flex gap-0.5">
                <Star className={`w-3 h-3 mb-1 ${difficulty === 'HARD' ? 'fill-current' : ''}`} />
                <Star className={`w-3 h-3 mb-1 ${difficulty === 'HARD' ? 'fill-current' : ''}`} />
                <Star className={`w-3 h-3 mb-1 ${difficulty === 'HARD' ? 'fill-current' : ''}`} />
              </div>
              <span className="font-bold text-sm">HARD</span>
            </button>
          </div>

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
        <GameCanvas 
          onGameOver={handleGameOver} 
          onExit={exitGame} 
          isMuted={isMuted}
          toggleMute={toggleMute}
          difficulty={difficulty}
        />
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
            {/* Show difficulty badge */}
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${
                difficulty === 'EASY' ? 'bg-green-100 text-green-700 border-green-200' :
                difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                'bg-red-100 text-red-700 border-red-200'
            }`}>
                {difficulty} MODE
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
      
      {/* Global CSS for custom animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
        
        @keyframes jump-arc {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.1) translateY(-30%); }
          100% { transform: scale(1) translateY(0); }
        }
        .animate-jump {
          animation: jump-arc 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
