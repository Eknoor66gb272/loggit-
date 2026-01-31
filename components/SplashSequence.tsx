import React, { useEffect, useState } from 'react';
import Logo from './Logo';

interface SplashSequenceProps {
  onComplete: () => void;
}

const SplashSequence: React.FC<SplashSequenceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'auth' | 'welcome' | 'brand' | 'motto'>('auth');
  const [showFinalLogo, setShowFinalLogo] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage('welcome'), 3000),   
      setTimeout(() => setStage('brand'), 6000),     
      setTimeout(() => setStage('motto'), 10000),    
      setTimeout(() => setShowFinalLogo(true), 12000), 
      setTimeout(() => onComplete(), 15000)          
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  const mottoText = "Every Hour Counts. Every Task Matters.";
  
  // Chromatic Identity Sync: Baby Blue, White, Green, Peach, Space, Green, Red
  const brandLetterColors = [
    'text-[#89CFF0]',  // L (Baby Blue)
    'text-white',      // o (White)
    'text-[#10b981]',  // g (Green)
    'text-[#E8B49A]',  // g (Peach)
    'text-transparent w-8', // space
    'text-[#10b981]',  // I (Emerald)
    'text-[#F04C63]',  // T (Red)
  ];

  const renderKineticMotto = () => {
    const words = mottoText.split(' ');
    let charCounter = 0;

    return (
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 px-10 max-w-7xl mx-auto mb-16">
        {words.map((word, wIdx) => (
          <div key={wIdx} className="whitespace-nowrap inline-flex">
            {word.split('').map((char, cIdx) => {
              const delay = charCounter * 70;
              charCounter++;
              return (
                <span
                  key={cIdx}
                  style={{ animationDelay: `${delay}ms` }}
                  className="text-4xl md:text-6xl font-black text-white logo-font tracking-tight animate-kinetic-drop inline-block"
                >
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[999] overflow-hidden select-none">
      <div className="absolute inset-0 bg-radial-gradient from-slate-900/40 via-black to-black"></div>
      
      {stage === 'auth' && (
        <div className="text-center animate-in fade-in zoom-in duration-1000 w-full h-full flex flex-col items-center justify-center relative">
          <div className="flex flex-col items-center mb-16">
             <div className="w-28 h-28 rounded-[2.5rem] border-4 border-[#89CFF0] flex items-center justify-center mb-10 bg-[#89CFF0]/5 shadow-[0_0_60px_rgba(137,207,240,0.1)]">
                <i className="fa-solid fa-fingerprint text-[#89CFF0] text-5xl animate-pulse"></i>
             </div>
             <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight logo-font mb-4">
                Identity <span className="text-[#89CFF0]">Confirmed</span>
             </h2>
             <p className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-[#10b981] logo-font">
                Access granted.
             </p>
          </div>
        </div>
      )}

      {stage === 'welcome' && (
        <div className="animate-welcome-impact flex items-center justify-center w-full">
          <h1 className="text-[15vw] font-black text-[#89CFF0] logo-font uppercase tracking-tighter filter drop-shadow-[0_0_50px_rgba(137,207,240,0.3)]">
            WELCOME
          </h1>
        </div>
      )}

      {stage === 'brand' && (
        <div className="text-center px-4">
          <div className="flex justify-center items-end flex-nowrap gap-2 md:gap-4 mb-12">
            {"Logg IT".split('').map((char, i) => (
              <span 
                key={i}
                style={{ animationDelay: `${i * 200}ms` }}
                className={`text-[12vw] md:text-[10vw] font-black logo-font uppercase animate-brand-reveal tracking-tighter drop-shadow-2xl leading-none ${brandLetterColors[i]}`}
              >
                {char}
              </span>
            ))}
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1500 delay-[1500ms] opacity-0 fill-mode-forwards">
            <p className="text-[#89CFF0] text-4xl md:text-6xl font-black uppercase tracking-[0.8em] logo-font drop-shadow-lg">
              Payroll <span className="text-[#E8B49A]">System</span>
            </p>
          </div>
        </div>
      )}

      {stage === 'motto' && (
        <div className="w-full flex flex-col items-center">
          {renderKineticMotto()}
          
          {showFinalLogo && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 flex flex-col items-center">
               <Logo size="xxl" subtitle="PAYROLL SYSTEM" />
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes welcome-impact {
          0% { transform: scale(0.05); opacity: 0; filter: blur(20px); }
          30% { transform: scale(1); opacity: 1; filter: blur(0px); }
          90% { transform: scale(1.05); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1.05); opacity: 0; filter: blur(10px); }
        }
        .animate-welcome-impact {
          animation: welcome-impact 3s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @keyframes brand-reveal {
          0% { transform: translateY(30px) scale(0.8); filter: blur(15px); opacity: 0; }
          60% { transform: translateY(-5px) scale(1.05); filter: blur(0px); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-brand-reveal {
          display: inline-block;
          animation: brand-reveal 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
        }

        @keyframes kinetic-drop {
          0% { transform: translateY(-100vh) scaleY(2); opacity: 0; filter: blur(10px); }
          50% { transform: translateY(0) scaleY(1); opacity: 1; filter: blur(0px); }
          75% { transform: translateY(-20px) scaleY(0.9); }
          90% { transform: translateY(5px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-kinetic-drop {
          animation: kinetic-drop 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }

        .bg-radial-gradient {
          background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to));
        }
        
        .fill-mode-forwards {
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashSequence;