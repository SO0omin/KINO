import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#FDFDFD] border-t border-black/5 py-16 relative font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
          {/* 로고 & 팀 소개 */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-col leading-none">
              <span className="font-display text-5xl tracking-tighter text-[#1A1A1A]">KINO</span>
              <span className="font-bold text-xs tracking-[0.6em] text-black/40 ml-1">TEAM PROJECT</span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-black/60 font-medium">
              KINO는 영화 예매 흐름을 직접 설계하고 구현한 팀 프로젝트입니다.<br/>
              실제 서비스처럼 자연스럽게 동작하는 경험을 목표로, <br className="hidden md:block"/>
              프론트엔드와 백엔드를 함께 완성했습니다.
            </p>
          </div>

          {/* SNS 아이콘 */}
          <div className="flex items-center gap-4">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-black/40 hover:bg-[#B91C1C] hover:border-[#B91C1C] hover:text-white transition-all duration-300">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div className="pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
          <p>Crafted by Team KINO. For learning, collaboration, and better UX.</p>
          <p>© 2026 KINO PROJECT. ALL RIGHTS RESERVED.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;