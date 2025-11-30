
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, GameItem, Particle, Difficulty } from '../types';
import { RabbitSVG, CarrotSVG, RockSVG, HeartSVG, BrokenHeartSVG } from './Assets';
import { playSound, musicManager } from '../utils/sound';
import { RotateCcw, ChevronLeft, ChevronRight, Pause, Play, LogOut, Volume2, VolumeX } from 'lucide-react';

// Constants
const LANES = 3;
const MAX_LIVES = 3;

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  difficulty: Difficulty;
}

// Configuration per difficulty
const DIFFICULTY_CONFIG = {
  EASY: {
    startSpeed: 0.4,
    spawnRate: 70, // Frames between spawns (higher = slower spawn)
    rockChance: 0.2, // 20% chance of rock
    speedIncrement: 0.02
  },
  MEDIUM: {
    startSpeed: 0.6,
    spawnRate: 60,
    rockChance: 0.35,
    speedIncrement: 0.05
  },
  HARD: {
    startSpeed: 0.8,
    spawnRate: 45,
    rockChance: 0.5,
    speedIncrement: 0.08
  }
};

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onExit, isMuted, toggleMute, difficulty }) => {
  // Game Logic State (Refs for performance in game loop)
  const itemsRef = useRef<GameItem[]>([]);
  const frameRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const speedRef = useRef<number>(DIFFICULTY_CONFIG[difficulty].startSpeed);
  const rabbitLaneRef = useRef<number>(1);
  const isHitRef = useRef<boolean>(false);
  const hitTimerRef = useRef<number>(0);
  const requestRef = useRef<number>();
  const jumpTimeoutRef = useRef<number>(0);
  
  // React State for UI updates
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [rabbitLane, setRabbitLane] = useState(1);
  const [isHit, setIsHit] = useState(false); // For visual feedback
  const [isJumping, setIsJumping] = useState(false); // For jump animation
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  // Get current config
  const config = DIFFICULTY_CONFIG[difficulty];

  // Spawn a particle explosion
  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Math.random(),
        x,
        y,
        color,
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        },
        life: 1.0
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const moveRabbit = useCallback((direction: 'left' | 'right') => {
    if (isHitRef.current || isPaused) return; // Cannot move while stunned or paused
    
    let newLane = rabbitLaneRef.current;
    if (direction === 'left' && newLane > 0) newLane--;
    if (direction === 'right' && newLane < LANES - 1) newLane++;
    
    if (newLane !== rabbitLaneRef.current) {
      rabbitLaneRef.current = newLane;
      setRabbitLane(newLane);
      playSound('jump');
      
      // Trigger jump animation
      setIsJumping(true);
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
      jumpTimeoutRef.current = window.setTimeout(() => setIsJumping(false), 200);
    }
  }, [isPaused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.key === 'ArrowLeft') moveRabbit('left');
      if (e.key === 'ArrowRight') moveRabbit('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveRabbit, isPaused]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    };
  }, []);

  // Main Game Loop
  const animate = useCallback(() => {
    frameRef.current++;

    // 1. Spawn Items
    if (frameRef.current % config.spawnRate === 0) {
      const type = Math.random() > (1 - config.rockChance) ? 'rock' : 'carrot'; 
      const lane = Math.floor(Math.random() * LANES);
      
      // Prevent spawning rock on top of rock immediately in same lane to avoid impossible situations
      const lastItemInLane = itemsRef.current.find(i => i.lane === lane && i.y < 20);
      
      if (!lastItemInLane) {
        itemsRef.current.push({
          id: Date.now() + Math.random(),
          type,
          lane,
          y: -20 // Start above screen
        });
      }
    }

    // 2. Move Items & Cleanup
    itemsRef.current = itemsRef.current
      .map(item => ({ ...item, y: item.y + speedRef.current }))
      .filter(item => item.y < 120);

    // 3. Collision Detection
    // Rabbit is roughly at y=80, height=15 (percent)
    // Hitbox approximation
    const rabbitY = 80;
    const hitBoxThreshold = 8; // tolerance

    itemsRef.current = itemsRef.current.filter(item => {
      const inLane = item.lane === rabbitLaneRef.current;
      const verticalHit = Math.abs(item.y - rabbitY) < hitBoxThreshold;

      if (inLane && verticalHit) {
        if (item.type === 'carrot') {
          scoreRef.current += 1;
          setScore(scoreRef.current);
          playSound('collect');
          spawnParticles(item.lane * 33 + 16, item.y, '#fb923c'); // Orange sparkles
          
          // Speed up slightly every 5 carrots based on difficulty increment
          if (scoreRef.current % 5 === 0) {
            speedRef.current += config.speedIncrement;
          }
          return false; // Remove item
        } else if (item.type === 'rock' && !isHitRef.current) {
          // Hit a rock
          isHitRef.current = true;
          hitTimerRef.current = 60; // Stun duration (frames)
          setIsHit(true);
          setLives(prev => {
             const newLives = prev - 1;
             if (newLives <= 0) {
                 // Defer game over slightly so render updates first
                 setTimeout(() => onGameOver(scoreRef.current), 100);
             }
             return newLives;
          });
          playSound('hit');
          spawnParticles(item.lane * 33 + 16, item.y, '#9ca3af'); // Gray dust
          return false; // Remove rock
        }
      }
      return true; // Keep item
    });

    // 4. Handle Stun State
    if (isHitRef.current) {
      hitTimerRef.current--;
      if (hitTimerRef.current <= 0) {
        isHitRef.current = false;
        setIsHit(false);
      }
    }

    // 5. Animate Particles
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.velocity.x,
      y: p.y + p.velocity.y,
      life: p.life - 0.05
    })).filter(p => p.life > 0));

    requestRef.current = requestAnimationFrame(animate);
  }, [onGameOver, config]);

  // Start/Stop Game Loop based on Pause State
  useEffect(() => {
    if (isPaused) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      musicManager.pause();
    } else {
      musicManager.resume();
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPaused, animate]);

  return (
    <div className="relative w-full h-full bg-green-50 overflow-hidden flex flex-col">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 pointer-events-none">
         {/* Lives */}
         <div className="flex gap-1 bg-white/80 p-2 rounded-full backdrop-blur-sm border border-green-200 shadow-sm">
            {[...Array(MAX_LIVES)].map((_, i) => (
              <div key={i}>
                {i < lives ? <HeartSVG /> : <BrokenHeartSVG />}
              </div>
            ))}
         </div>
         
         <div className="flex items-center gap-2 pointer-events-auto">
             {/* Score */}
             <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm border border-orange-200 shadow-sm">
               <div className="w-6 h-6"><CarrotSVG /></div>
               <span className="text-2xl font-bold text-orange-600">{score}</span>
             </div>
             
             {/* Mute Button (In-Game) */}
             <button 
                onClick={toggleMute}
                className="p-2 bg-white/80 rounded-full hover:bg-white active:scale-95 transition-all shadow-sm border border-gray-200 text-gray-600"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
             </button>

             {/* Pause Button */}
             <button 
                onClick={() => setIsPaused(true)}
                className="p-2 bg-white/80 rounded-full hover:bg-white active:scale-95 transition-all shadow-sm border border-blue-200 text-blue-600"
                aria-label="Pause"
             >
                <Pause className="w-6 h-6" />
             </button>
         </div>
      </div>

      {/* Exit Button (Bottom Left) */}
      <button 
        onClick={onExit}
        className="absolute bottom-4 left-4 z-30 p-2 bg-white/50 rounded-full hover:bg-white active:scale-95 transition-all"
      >
        <RotateCcw className="w-6 h-6 text-gray-600" />
      </button>

      {/* Game World */}
      <div className="relative flex-1 w-full max-w-md mx-auto h-full border-x-4 border-green-200 bg-green-100 overflow-hidden">
        
        {/* Grass Lanes Background */}
        <div className="absolute inset-0 flex w-full h-full opacity-30">
           <div className="flex-1 bg-green-200 border-r border-green-300"></div>
           <div className="flex-1 bg-green-100 border-r border-green-300"></div>
           <div className="flex-1 bg-green-200"></div>
        </div>

        {/* Lane Click Areas (Invisible touch controls) */}
        <div className="absolute inset-0 flex z-10">
           <div className="flex-1 active:bg-white/10 transition-colors" onPointerDown={() => moveRabbit('left')}></div>
           <div className="flex-1" onPointerDown={() => {/* Center tap does nothing */}}></div>
           <div className="flex-1 active:bg-white/10 transition-colors" onPointerDown={() => moveRabbit('right')}></div>
        </div>

        {/* Large Visual Touch Hints for Kids */}
        <div className="absolute bottom-0 w-full h-32 flex justify-between px-4 pb-8 pointer-events-none opacity-50">
            <div className={`p-4 rounded-full bg-white/40 border-2 border-white transition-transform ${rabbitLane === 0 ? 'scale-90 bg-white/60' : ''}`}>
                <ChevronLeft className="w-8 h-8 text-green-700" />
            </div>
            <div className={`p-4 rounded-full bg-white/40 border-2 border-white transition-transform ${rabbitLane === 2 ? 'scale-90 bg-white/60' : ''}`}>
                <ChevronRight className="w-8 h-8 text-green-700" />
            </div>
        </div>

        {/* Render Items */}
        {itemsRef.current.map(item => (
          <div
            key={item.id}
            className="absolute w-1/3 p-4 transition-transform duration-75"
            style={{
              left: `${item.lane * 33.33}%`,
              top: `${item.y}%`,
              height: '15%',
            }}
          >
             {item.type === 'carrot' ? <CarrotSVG /> : <RockSVG />}
          </div>
        ))}

        {/* Render Particles */}
        {particles.map(p => (
           <div 
             key={p.id}
             className="absolute w-3 h-3 rounded-full"
             style={{
               left: `${p.x}%`,
               top: `${p.y}%`,
               backgroundColor: p.color,
               opacity: p.life,
               transform: 'translate(-50%, -50%)'
             }}
           />
        ))}

        {/* Render Rabbit */}
        <div 
          className="absolute w-1/3 transition-all duration-200 ease-out"
          style={{
            left: `${rabbitLane * 33.33}%`,
            top: '80%',
            height: '15%',
          }}
        >
          <div className="w-full h-full p-2">
            <RabbitSVG isHit={isHit} isJumping={isJumping} />
          </div>
        </div>
        
        {/* Pause Overlay */}
        {isPaused && (
           <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center">
             <div className="bg-white p-6 rounded-3xl shadow-2xl animate-fade-in flex flex-col items-center gap-4 min-w-[200px]">
                <h2 className="text-3xl font-black text-blue-500 mb-2">PAUSED</h2>
                
                <button 
                  onClick={() => setIsPaused(false)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-6 h-6 fill-current" />
                  RESUME
                </button>

                <button 
                  onClick={onExit}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-600 text-lg font-bold py-3 px-8 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  EXIT
                </button>
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default GameCanvas;
