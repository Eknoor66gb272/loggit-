
import React, { useState, useEffect } from 'react';

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-2 text-center">
      {/* Reduced from 9xl to 6xl/7xl range */}
      <div className="text-5xl md:text-7xl font-black text-white tracking-[0.05em] tabular-nums mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] leading-none">
        {formatTime(time)}
      </div>
      <div className="text-[10px] md:text-sm font-black text-[#E8B49A] tracking-[0.5em] logo-font border-t-2 border-slate-800/60 pt-4 w-full max-w-[300px]">
        {formatDate(time)}
      </div>
    </div>
  );
};

export default DigitalClock;
