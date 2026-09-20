type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  animate?: boolean;
};

const sizes = {
  sm: { img: 'h-8', text: 'text-lg' },
  md: { img: 'h-10', text: 'text-xl' },
  lg: { img: 'h-16', text: 'text-3xl' },
  xl: { img: 'h-24 md:h-32', text: 'text-4xl md:text-5xl' },
};

export const Logo = ({ size = 'md', className = '', showText = true, animate = false }: LogoProps) => {
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${animate ? 'animate-float' : ''}`}>
        <img
          src="/logo.jpg"
          alt="Doodle Room Logo"
          className={`${s.img} w-auto object-contain rounded-md`}
          onError={(e) => {
            // Fallback: hide broken image, show styled text instead
            (e.target as HTMLImageElement).style.display = 'none';
            const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        {/* Fallback if image fails */}
        <div
          className={`${s.img} aspect-square bg-terracotta rounded-xl items-center justify-center shadow-btn hidden`}
        >
          <span className="text-white font-bold font-display text-xl">D</span>
        </div>
      </div>
      {showText && (
        <div>
          <span className={`${s.text} font-display font-bold text-ink leading-none`}>
            Doodle Room
          </span>
        </div>
      )}
    </div>
  );
};
