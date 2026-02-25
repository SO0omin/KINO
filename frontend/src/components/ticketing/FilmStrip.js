import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
const FilmStrip = () => {
    return (_jsx("div", { className: "w-full bg-black h-8 flex items-center justify-around overflow-hidden", children: Array.from({ length: 40 }).map((_, i) => (_jsx("div", { className: "w-4 h-4 bg-white/90 rounded-[2px] shrink-0" }, i))) }));
};
export default FilmStrip;
