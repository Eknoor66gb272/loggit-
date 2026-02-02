import React, { useState, useEffect } from 'react';

const AnalogClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secDeg = (seconds / 60) * 360;
  const minDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourDeg = (hours % 12 / 12) * 360 + (minutes / 60) * 30;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full scale-100 md:scale-110 origin-center animate-in fade-in duration-1000">
      {/* The Big Ben Tower Structure - HIDDEN ON MOBILE */}
      <div className="relative flex flex-col items-center">
        
        {/* The Ayrton Light (Top Lantern) */}
        <div className="hidden md:block relative z-30 mb-[-12px]">
          <div className="w-7 h-12 bg-slate-800 rounded-t-full relative shadow-lg">
             <div className="absolute top-1 left-1 right-1 bottom-1 bg-yellow-400/90 animate-pulse rounded-t-full shadow-[0_0_25px_#facc15]"></div>
          </div>
          <div className="w-12 h-2.5 bg-slate-800 mx-auto rounded-full"></div>
        </div>

        {/* Spire / Roof */}
        <div className="hidden md:block relative z-20">
          <div className="w-0 h-0 border-l-[75px] border-l-transparent border-r-[75px] border-r-transparent border-b-[110px] border-b-slate-900 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"></div>
          <div className="absolute -top-8 left-1/2 -ml-1 w-2.5 h-10 bg-yellow-500 rounded-full shadow-[0_0_20px_#facc15] z-40 border border-yellow-600"></div>
          <div className="absolute top-14 left-1/2 -ml-10 w-20 h-10 flex justify-around">
            <div className="w-4 h-6 bg-slate-900/60 rounded-t-full border border-yellow-600/30"></div>
            <div className="w-4 h-6 bg-slate-900/60 rounded-t-full border border-yellow-600/30"></div>
          </div>
        </div>

        {/* Belfry Section (Detailed Arches) */}
        <div className="hidden md:block w-60 h-36 bg-[#D4C38B] border-x-[6px] border-t-[6px] border-[#A39462] z-10 relative shadow-[inset_-20px_0_40px_rgba(0,0,0,0.1),0_10px_30px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, #86794d 11px)' }}></div>
          <div className="flex justify-center gap-4 pt-6">
            <div className="w-7 h-24 bg-slate-950/70 rounded-t-full border-t-2 border-yellow-600/20 shadow-inner"></div>
            <div className="w-7 h-28 bg-slate-950/70 rounded-t-full border-t-2 border-yellow-600/20 shadow-inner"></div>
            <div className="w-7 h-24 bg-slate-950/70 rounded-t-full border-t-2 border-yellow-600/20 shadow-inner"></div>
          </div>
        </div>

        {/* Clock Housing (The Main Face) */}
        <div className="relative z-10 w-56 h-56 md:w-80 md:h-80 bg-[#C2B280] md:bg-[#C2B280] rounded-full md:rounded-none border-[6px] md:border-[8px] border-[#A39462] shadow-2xl flex items-center justify-center p-4 md:p-8 masonry-texture overflow-hidden transition-all duration-700">
          <div className="absolute inset-0 border-[10px] md:border-[16px] border-[#A39462]/30 pointer-events-none rounded-full md:rounded-none"></div>
          
          {/* Corner Medallions */}
          <div className="hidden md:flex absolute top-3 left-3 w-10 h-10 rounded-full bg-[#A39462]/40 border border-yellow-600/40 items-center justify-center text-[10px] text-yellow-700 shadow-inner">⚜</div>
          <div className="hidden md:flex absolute top-3 right-3 w-10 h-10 rounded-full bg-[#A39462]/40 border border-yellow-600/40 items-center justify-center text-[10px] text-yellow-700 shadow-inner">⚜</div>
          <div className="hidden md:flex absolute bottom-3 left-3 w-10 h-10 rounded-full bg-[#A39462]/40 border border-yellow-600/40 items-center justify-center text-[10px] text-yellow-700 shadow-inner">⚜</div>
          <div className="hidden md:flex absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#A39462]/40 border border-yellow-600/40 items-center justify-center text-[10px] text-yellow-700 shadow-inner">⚜</div>

          {/* Clock Face */}
          <div className="relative w-full h-full rounded-full border-[6px] md:border-[10px] border-[#1e293b] bg-[#FDF5E6] shadow-[inset_0_0_60px_rgba(0,0,0,0.1),0_0_30px_rgba(163,148,98,0.4)] overflow-hidden ring-2 md:ring-4 ring-yellow-600/30">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/parchment.png")' }}></div>
            
            {/* Ticks */}
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="absolute top-0 left-1/2 w-1.5 md:w-2 h-full -ml-0.75 md:-ml-1"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <div className={`w-full h-6 md:h-10 ${i % 3 === 0 ? 'bg-slate-950 h-8 md:h-12' : 'bg-slate-700'} rounded-sm`}></div>
                <div className="hidden md:block text-[11px] font-black text-slate-900 absolute top-12 left-1/2 -ml-3 w-6 text-center logo-font">
                   {i === 0 ? 'XII' : i === 3 ? 'III' : i === 6 ? 'VI' : i === 9 ? 'IX' : ''}
                </div>
              </div>
            ))}

            <div className="absolute inset-8 md:inset-12 rounded-full border border-yellow-600/20 shadow-inner pointer-events-none"></div>

            {/* Hour Hand - Full proportional length and Blue color */}
            <div 
              className="absolute top-0 left-1/2 w-3 md:w-4.5 h-full -ml-1.5 md:-ml-[2.25px] transition-all duration-500 z-30"
              style={{ transform: `rotate(${hourDeg}deg)` }}
            >
              <div className="w-full h-[41%] md:h-[43%] mt-[9%] md:mt-[7%] bg-[#89CFF0] rounded-full flex flex-col items-center shadow-[0_5px_15px_rgba(137,207,240,0.3)] border border-[#89CFF0]/40">
                {/* Decorative medallion on hand */}
                <div className="w-4 h-4 md:w-7 md:h-7 bg-[#89CFF0] rounded-full -mt-2 md:-mt-3 border-[2px] md:border-[3px] border-black/20 shadow-md"></div>
              </div>
            </div>

            {/* Minute Hand - Blue color, reaches edge */}
            <div 
              className="absolute top-0 left-1/2 w-2 md:w-3 h-full -ml-1 md:-ml-[1.5px] transition-all duration-500 z-30"
              style={{ transform: `rotate(${minDeg}deg)` }}
            >
              <div className="w-full h-[48%] md:h-[49%] mt-[2%] md:mt-[1%] bg-[#89CFF0] rounded-full shadow-[0_5px_20px_rgba(137,207,240,0.4)] border border-[#89CFF0]/30"></div>
            </div>

            {/* Second Hand */}
            <div 
              className="absolute top-0 left-1/2 w-0.5 h-full -ml-0.25 transition-all duration-150 z-40"
              style={{ transform: `rotate(${secDeg}deg)` }}
            >
              <div className="w-full h-[50%] md:h-[54%] mt-[6%] md:mt-[2%] bg-[#F04C63] rounded-full shadow-[0_0_20px_#F04C63]"></div>
              <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 -ml-1.25 md:-ml-[7px] absolute top-[53%] md:top-[56%] left-0 bg-[#F04C63] rounded-full ring-2 md:ring-4 ring-black shadow-md"></div>
            </div>

            {/* Center Hub */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 md:w-8 md:h-8 -mt-2 md:-mt-4 -ml-2 md:-ml-4 bg-slate-950 border-[2px] md:border-[4px] border-yellow-600 rounded-full z-50 flex items-center justify-center shadow-2xl">
               <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-yellow-400 rounded-full shadow-[0_0_5px_white]"></div>
            </div>
          </div>
        </div>

        {/* Tower Base - HIDDEN ON MOBILE */}
        <div className="hidden md:flex w-64 md:w-72 h-40 bg-[#C2B280] border-x-[6px] border-[#A39462] relative overflow-hidden flex-col items-center masonry-texture shadow-[inset_-20px_0_40px_rgba(0,0,0,0.1)]">
          <div className="flex gap-12 pt-6">
            <div className="w-4 h-full bg-black/15 shadow-inner"></div>
            <div className="w-4 h-full bg-black/15 shadow-inner"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-16 border-2 border-yellow-600/10 rounded-t-full"></div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/30 border-t-2 border-black/20"></div>
        </div>
      </div>

      <style>{`
        .masonry-texture {
          background-image: 
            linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.04) 50%),
            linear-gradient(rgba(0,0,0,0.04) 50%, transparent 50%);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
};

export default AnalogClock;