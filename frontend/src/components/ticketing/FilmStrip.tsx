import React from 'react';

const FilmStrip = () => {
  return (
    <div className="flex gap-2 overflow-hidden opacity-20 select-none pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-12 h-8 border-x border-white/30 flex flex-col justify-between py-1">
          <div className="w-full h-1 bg-white/20"></div>
          <div className="w-full h-1 bg-white/20"></div>
        </div>
      ))}
    </div>
  );
};

export default FilmStrip;
