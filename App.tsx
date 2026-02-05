
import React, { useState, useEffect, useRef } from 'react';
import FloatingHearts from './components/FloatingHearts';
import NoButton from './components/NoButton';
import SuccessView from './components/SuccessView';
import { AppState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('asking');
  const [typedTitle, setTypedTitle] = useState('');
  const [deniedToast, setDeniedToast] = useState(false);
  const [deniedMessage, setDeniedMessage] = useState("Denied. Please reconsider your life choices.");
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fullTitle = "Hey love...";

  const denialMessages = [
    "Denied. Please reconsider your life choices.",
    "Are you sure? My heart is breaking! 💔",
    "Nice try, but I'm persistent!",
    "You can't say no to this face! 🥺",
    "Don't be shy, say yes! ✨",
    "My mom says we'd be cute together.",
    "Clicking 'No' just makes me want you more!",
    "Are your glasses on? The other button is 'Yes'!",
    "Okay, playing hard to get... I like it."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedTitle(fullTitle.slice(0, i));
      i++;
      if (i > fullTitle.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Handle background music autoplay policy
  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
             // Autoplay started!
             window.removeEventListener('click', startAudio);
             window.removeEventListener('touchstart', startAudio);
          })
          .catch(err => console.log("Autoplay blocked, waiting for more interaction", err));
      }
    };

    // Try to play immediately on mount
    startAudio();

    // Add listeners for user interaction to trigger play if blocked
    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);
    window.addEventListener('scroll', startAudio);
    window.addEventListener('keydown', startAudio);

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('scroll', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  };

  const handleDenied = () => {
    setDeniedMessage(denialMessages[Math.floor(Math.random() * denialMessages.length)]);
    setDeniedToast(true);
    setTimeout(() => setDeniedToast(false), 2000);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 overflow-y-auto px-4 py-10 md:py-6">
      {/* Background music - Using a soft romantic piano track */}
      <audio 
        ref={audioRef}
        src="/media/lovesong.mp3" 
        loop 
        autoPlay
      />

      {/* Mute toggle button */}
      <button 
        onClick={toggleMute}
        className="fixed top-4 right-4 md:top-6 md:right-6 z-50 p-3 bg-white/40 backdrop-blur-md rounded-full border border-white/50 shadow-lg text-pink-600 active:scale-90 transition-all"
        aria-label="Toggle music"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Background decoration */}
      <FloatingHearts />
      
      {/* Sparkle overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p6.png')] opacity-10 pointer-events-none"></div>

      {view === 'asking' ? (
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center space-y-6 md:space-y-8 my-auto">
          {/* Main Card */}
          <div className="w-full bg-white/40 backdrop-blur-lg border border-white/50 shadow-2xl rounded-[32px] p-6 sm:p-8 md:p-12 text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
              <h2 className="font-script text-2xl sm:text-3xl md:text-4xl text-pink-500 min-h-[40px]">
                {typedTitle}<span className="animate-pulse">|</span>
              </h2>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-800 tracking-tight leading-tight">
                Will you be my <br className="hidden md:block" />
                <span className="text-pink-600">Valentine?</span>
              </h1>
              <p className="text-gray-600 text-sm sm:text-base md:text-xl font-medium leading-relaxed max-w-xs md:max-w-lg mx-auto">
               You’ve been living in my heart quietly... I won’t keep it a secret anymore. Will you be my Valentine? 💖
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 pt-2 md:pt-4">
              <button
                onClick={() => setView('success')}
                className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-black text-lg md:text-2xl shadow-2xl shadow-pink-200 transition-all hover:scale-105 active:scale-90 flex items-center justify-center gap-3 group relative overflow-hidden active:bg-pink-800"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                <span>YES, I will</span>
                <span className="group-hover:animate-bounce">💘</span>
              </button>
              
              <div className="flex items-center justify-center min-h-[50px] md:min-h-[60px]">
                <NoButton onAttemptClick={handleDenied} />
              </div>
            </div>

            <div className="pt-2 md:pt-4 flex flex-col gap-3">
              <p className="text-gray-400 text-[10px] md:text-xs italic leading-snug">
                “I promise good vibes, your favorite snacks, and me trying my best to be romantic…because I want you smiling the whole time”
              </p>
              <p className="text-pink-400 text-[10px] animate-pulse font-black uppercase tracking-widest">
                Tap to catch the heart
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center">
            <p className="text-gray-400 text-[10px] md:text-xs font-medium italic opacity-80">
              "Powered by Love | Wazimu Creator"
            </p>
          </footer>
        </div>
      ) : (
        <SuccessView />
      )}

      {/* Denied Toast */}
      {deniedToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-10 duration-300 flex items-center gap-3 w-[90%] max-w-sm">
          <span className="text-xl">🙅🏾‍♂️</span>
          <span className="font-bold text-sm">{deniedMessage}</span>
        </div>
      )}
    </main>
  );
};

export default App;
