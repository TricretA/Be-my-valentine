
import React, { useState, useCallback } from 'react';

interface NoButtonProps {
  onAttemptClick: () => void;
}

const microCopies = [
  "Nice try.",
  "Not today.",
  "Under maintenance.",
  "Cursor too aggressive!",
  "Try again!",
  "Missed me!",
  "Denied!",
  "Hehe nope.",
  "Try catching me! 🏃‍♂️",
  "Oop! 💨"
];

const NoButton: React.FC<NoButtonProps> = ({ onAttemptClick }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [tip, setTip] = useState<string | null>(null);
  const [isTeleporting, setIsTeleporting] = useState(false);

  const dodge = useCallback(() => {
    const isTeleport = Math.random() > 0.85;
    
    setIsTeleporting(isTeleport);

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // We want to keep it within the card's general area mostly, 
    // but on mobile it can jump around more.
    // Calculate bounds relative to the current center
    const horizontalRange = Math.min(viewportWidth * 0.4, 200);
    const verticalRange = Math.min(viewportHeight * 0.3, 150);
    
    const newX = (Math.random() - 0.5) * horizontalRange * 2;
    const newY = (Math.random() - 0.5) * verticalRange * 2;
    
    setPos({ x: newX, y: newY });
    
    // Random scale and slight rotation
    setScale(Math.random() * 0.3 + 0.7);

    // Show funny tip
    const randomTip = microCopies[Math.floor(Math.random() * microCopies.length)];
    setTip(randomTip);
    setTimeout(() => setTip(null), 800);
  }, []);

  return (
    <div 
      className={`relative inline-block ${isTeleporting ? '' : 'dodge-transition'}`} 
      style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
    >
      {tip && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/95 px-4 py-1.5 rounded-full text-xs font-black text-pink-600 shadow-xl border border-pink-100 whitespace-nowrap animate-in fade-in zoom-in slide-in-from-bottom-4 duration-200 z-30">
          {tip}
        </div>
      )}
      <button
        onMouseEnter={dodge}
        onTouchStart={(e) => {
          e.preventDefault();
          dodge();
        }}
        onClick={(e) => {
          e.preventDefault();
          dodge();
          onAttemptClick();
        }}
        className="px-8 py-4 bg-white/40 backdrop-blur-md hover:bg-white/90 border-2 border-pink-200 text-pink-500 rounded-full font-black shadow-lg transition-all flex items-center gap-2 group whitespace-nowrap active:scale-90"
      >
        <span className="text-sm uppercase tracking-widest">No</span>
        <span className="group-hover:scale-125 transition-transform duration-300">🙅🏾‍♂️</span>
      </button>
    </div>
  );
};

export default NoButton;