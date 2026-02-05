
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { toPng } from 'html-to-image';

type SuccessStep = 'video' | 'plan';

const SuccessView: React.FC = () => {
  const [step, setStep] = useState<SuccessStep>('video');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [details, setDetails] = useState({
    when: "Valentine's Day ❤️",
    where: "Our favorite place 🏰",
    dressCode: "Stunning & Cute ✨"
  });

  // Generate confetti burst
  const confettiPieces = useMemo(() => {
    const emojis = ['💖', '🌸', '✨', '💘', '🍓', '💌', '🌹', '❤️', '🍭', '🧸'];
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 3,
      size: Math.random() * 20 + 12,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));
  }, []);

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    
    setIsCapturing(true);
    setShowFlash(true);
    
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(cardRef.current!, { 
          cacheBust: true, 
          pixelRatio: 2,
          backgroundColor: '#fff0f3',
          style: {
            borderRadius: '40px',
            transform: 'scale(1)',
          }
        });
        
        const link = document.createElement('a');
        link.download = 'valentine-date-invite.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Capture failed:', err);
        alert("Couldn't auto-save, please take a quick screenshot! 📸");
      } finally {
        setIsCapturing(false);
        setTimeout(() => setShowFlash(false), 500);
      }
    }, 150);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full p-4 pt-12 md:pt-4 text-center space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-700 relative z-20 overflow-y-auto max-h-screen pb-10">
      {showFlash && <div className="shutter-flash" />}

      <div className="space-y-2 md:space-y-4 relative z-30 flex-shrink-0">
        <h1 className="text-5xl md:text-7xl font-script text-pink-600 drop-shadow-xl animate-bounce">
          WOOOOW!! 💘
        </h1>
        <p className="text-pink-500 font-black text-sm md:text-xl bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full inline-block shadow-sm">
          Best decision ever!
        </p>
      </div>

      {step === 'video' ? (
        <div className="w-full max-w-sm md:max-w-md space-y-6 animate-in slide-in-from-bottom-12 duration-700 flex flex-col items-center z-30">
          <div className="w-full bg-white/40 backdrop-blur-2xl rounded-[32px] overflow-hidden border border-white/60 shadow-2xl aspect-[16/9] md:aspect-video relative group">
            <img 
              src="/media/love2.gif" 
              alt="Romantic GIF"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/40 to-transparent flex items-end justify-center pb-6">
               <span className="text-white font-bold text-lg drop-shadow-md">You & Me. 💖</span>
            </div>
          </div>
          
          <button 
            onClick={() => setStep('plan')}
            className="w-full py-5 bg-gradient-to-r from-pink-500 to-rose-500 active:bg-pink-800 text-white rounded-full font-black text-lg shadow-xl shadow-pink-200 transition-all active:scale-90 flex items-center justify-center gap-3 group animate-pulse"
          >
            <span>Plan out date 🗓️</span>
            <span className="group-hover:translate-x-1 transition-transform">➡️</span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm md:max-w-md space-y-6 animate-in slide-in-from-bottom-12 duration-700 flex flex-col items-center z-30">
          {/* Captureable Card Area */}
          <div 
            ref={cardRef} 
            className="w-full bg-white/60 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-white/80 shadow-[0_20px_60px_rgba(255,182,193,0.3)] space-y-6 md:space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 text-4xl">💖</div>
            <div className="absolute bottom-0 left-0 p-4 opacity-20 text-4xl">🌸</div>
            
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Our Date Plan ✨</h2>
              <div className="w-12 h-1 bg-pink-500 rounded-full mx-auto mt-1" />
            </div>
            
            <div className="space-y-4 md:space-y-6 text-left relative">
              <div className="space-y-1 group">
                <label className="text-[10px] text-pink-500 font-black uppercase tracking-[0.2em] ml-1">When</label>
                <input 
                  type="text" 
                  value={details.when}
                  onChange={(e) => setDetails({...details, when: e.target.value})}
                  className="w-full bg-white/80 border-2 border-transparent focus:border-pink-300 rounded-xl px-4 py-3 text-gray-800 font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all"
                  placeholder="E.g. Friday at 7pm..."
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] text-pink-500 font-black uppercase tracking-[0.2em] ml-1">Where</label>
                <input 
                  type="text" 
                  value={details.where}
                  onChange={(e) => setDetails({...details, where: e.target.value})}
                  className="w-full bg-white/80 border-2 border-transparent focus:border-pink-300 rounded-xl px-4 py-3 text-gray-800 font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all"
                  placeholder="Our favorite spot..."
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] text-pink-500 font-black uppercase tracking-[0.2em] ml-1">Dress Code</label>
                <input 
                  type="text" 
                  value={details.dressCode}
                  onChange={(e) => setDetails({...details, dressCode: e.target.value})}
                  className="w-full bg-white/80 border-2 border-transparent focus:border-pink-300 rounded-xl px-4 py-3 text-gray-800 font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-100 transition-all"
                  placeholder="Something cute..."
                />
              </div>
            </div>

            <p className="text-pink-400 text-[10px] md:text-xs italic font-bold opacity-80">
              "I'm so excited to see you!"
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button 
              disabled={isCapturing}
              onClick={downloadCard} 
              className="w-full py-5 bg-gradient-to-r from-pink-500 to-rose-600 active:bg-pink-800 text-white rounded-full font-black text-lg shadow-xl shadow-pink-200 transition-all active:scale-90 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              <span>{isCapturing ? 'Capturing...' : 'Save & Send to Me'}</span>
              <span className={`transition-transform duration-300 ${isCapturing ? 'animate-spin' : 'group-hover:rotate-12 group-hover:scale-125'}`}>
                📸
              </span>
            </button>
            <button 
              onClick={() => setStep('video')}
              className="text-pink-500/70 text-sm font-bold hover:underline active:opacity-60 py-2"
            >
              ← Back to Love
            </button>
          </div>
        </div>
      )}

      {/* Confetti Background Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {confettiPieces.map((p) => (
          <div
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              fontSize: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuccessView;
