import React from 'react';

export const RabbitSVG: React.FC<{ isHit: boolean; isJumping?: boolean }> = ({ isHit, isJumping }) => {
  let animationClass = 'animate-bounce'; // Default idle
  
  if (isHit) {
    animationClass = 'scale-90 opacity-70';
  } else if (isJumping) {
    animationClass = 'animate-jump';
  }

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-lg transition-transform ${animationClass}`}>
      {/* Ears */}
      <ellipse cx="35" cy="20" rx="10" ry="25" fill="#fff" stroke="#eee" strokeWidth="2" />
      <ellipse cx="65" cy="20" rx="10" ry="25" fill="#fff" stroke="#eee" strokeWidth="2" />
      <ellipse cx="35" cy="20" rx="5" ry="15" fill="#ffb7b2" />
      <ellipse cx="65" cy="20" rx="5" ry="15" fill="#ffb7b2" />
      
      {/* Face */}
      <circle cx="50" cy="55" r="30" fill="#fff" stroke="#eee" strokeWidth="2" />
      
      {/* Eyes */}
      {isHit ? (
        <>
          <line x1="35" y1="45" x2="45" y2="55" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
          <line x1="45" y1="45" x2="35" y2="55" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
          <line x1="55" y1="45" x2="65" y2="55" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
          <line x1="65" y1="45" x2="55" y2="55" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <circle cx="40" cy="50" r="4" fill="#333" />
          <circle cx="60" cy="50" r="4" fill="#333" />
          <circle cx="42" cy="48" r="1.5" fill="#fff" />
          <circle cx="62" cy="48" r="1.5" fill="#fff" />
        </>
      )}

      {/* Nose & Mouth */}
      <ellipse cx="50" cy="60" rx="4" ry="3" fill="#ffb7b2" />
      <path d="M 50 63 Q 45 70 40 65" stroke="#333" strokeWidth="2" fill="none" />
      <path d="M 50 63 Q 55 70 60 65" stroke="#333" strokeWidth="2" fill="none" />

      {/* Cheeks */}
      <circle cx="35" cy="60" r="5" fill="#ffb7b2" opacity="0.5" />
      <circle cx="65" cy="60" r="5" fill="#ffb7b2" opacity="0.5" />
    </svg>
  );
};

export const CarrotSVG: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    {/* Greens */}
    <path d="M50 20 Q 30 5 40 30" stroke="#4ade80" strokeWidth="4" fill="none" />
    <path d="M50 20 Q 50 0 50 30" stroke="#22c55e" strokeWidth="4" fill="none" />
    <path d="M50 20 Q 70 5 60 30" stroke="#4ade80" strokeWidth="4" fill="none" />
    
    {/* Body */}
    <path d="M 35 25 Q 50 20 65 25 L 50 85 Z" fill="#fb923c" stroke="#ea580c" strokeWidth="2" strokeLinejoin="round" />
    
    {/* Details */}
    <line x1="40" y1="35" x2="50" y2="35" stroke="#ea580c" strokeWidth="2" opacity="0.5" />
    <line x1="55" y1="45" x2="60" y2="45" stroke="#ea580c" strokeWidth="2" opacity="0.5" />
    <line x1="42" y1="55" x2="52" y2="55" stroke="#ea580c" strokeWidth="2" opacity="0.5" />
  </svg>
);

export const RockSVG: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <path d="M 20 70 Q 30 30 50 35 Q 80 20 85 75 Z" fill="#9ca3af" stroke="#4b5563" strokeWidth="2" strokeLinejoin="round" />
    <path d="M 35 50 Q 45 45 50 55" stroke="#6b7280" strokeWidth="2" fill="none" />
  </svg>
);

export const HeartSVG: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500 drop-shadow">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export const BrokenHeartSVG: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-300">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" opacity="0.5"/>
  </svg>
);