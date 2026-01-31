import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'nav';
  subtitle?: string;
  isMainScreen?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', subtitle = 'PAYROLL SYSTEM', isMainScreen = false }) => {
  const logoBaseSize = isMainScreen 
    ? 'text-[76px]' 
    : (size === 'xxl' ? 'text-[64px] md:text-[72px]' : 
       size === 'xl' ? 'text-[45px]' : 
       size === 'lg' ? 'text-[38px]' : 
       size === 'nav' ? 'text-[28px] md:text-[34px]' : 'text-[22px]');
    
  const crownBaseSize = isMainScreen 
    ? 'w-26 h-26' 
    : (size === 'xxl' ? 'w-20 h-20 md:w-24 h-24' : 
       size === 'xl' ? 'w-15 h-15' : 
       size === 'nav' ? 'w-10 h-10 md:w-12 h-12' : 'w-11 h-11');
    
  const subtitleSize = isMainScreen 
    ? 'text-3xl' 
    : (size === 'xxl' ? 'text-base md:text-lg' : 
       size === 'nav' ? 'text-[6px] md:text-[8px]' : 'text-[7px]');
  
  const itOffset = isMainScreen 
    ? `-52px` 
    : (size === 'xxl' ? '-44px' : 
       size === 'xl' ? '-30px' : 
       size === 'nav' ? '-18px' : '-18px');
    
  const itShift = isMainScreen 
    ? '-8px' 
    : (size === 'xxl' ? '-6px' : 
       size === 'nav' ? '-2px' : '-4px');

  const crownBg = 'bg-[#89CFF0]';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-2 md:gap-4">
        <div className={`${crownBaseSize} ${crownBg} rounded-[0.8rem] md:rounded-[1.2rem] flex items-center justify-center shadow-xl transform rotate-3 shrink-0 transition-all`}>
          <i className="fa-solid fa-crown text-black text-sm md:text-lg lg:text-3xl"></i>
        </div>
        
        <div className="flex items-end pt-3">
          <div className={`${logoBaseSize} font-black tracking-tighter logo-font uppercase leading-none flex`}>
            <span className="text-[#89CFF0]">L</span>
            <span className="text-white">o</span>
            <span className="text-[#10b981]">g</span>
            <span className="text-[#E8B49A]">g</span>
          </div>
          <div className="relative">
             <span 
              className={`${logoBaseSize} font-black logo-font uppercase inline-block`}
              style={{ 
                transform: `rotate(-15deg) translateY(${itOffset}) translateX(${itShift})`,
                transformOrigin: 'bottom left',
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.8))'
              }}
            >
              <span className="text-[#10b981]">I</span><span className="text-[#F04C63]">T</span>
            </span>
          </div>
        </div>
      </div>
      
      {subtitle && (
        <div className={`${subtitleSize} font-black uppercase tracking-[0.4em] mt-3 md:mt-4 logo-font border-t-[2px] border-slate-800/80 pt-2 w-full text-center flex justify-center items-center gap-2`}>
          {subtitle === 'PAYROLL SYSTEM' ? (
            <>
              <span className="text-[#E8B49A]">PAYROLL</span>
              <span className="text-[#89CFF0]">SYSTEM</span>
            </>
          ) : (
            <span className="text-[#89CFF0]">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;