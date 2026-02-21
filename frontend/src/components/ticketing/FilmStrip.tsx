import React from 'react';

const FilmStrip: React.FC = () => {
  return (
    <div className="w-full bg-black h-8 flex items-center justify-around overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="w-4 h-4 bg-white/90 rounded-[2px] shrink-0"></div>
      ))}
    </div>
  );
};

export default FilmStrip;
