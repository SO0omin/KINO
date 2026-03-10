import React from 'react';
import { useMainData } from '../hooks/useMainData';
import HeroSection from '../components/main/HeroSection';
import RankingSection from '../components/main/RankingSection';
import QuickMenuSection from '../components/main/QuickMenuSection';
import BenefitSection from '../components/main/BenefitSection';
import ReviewSection from '../components/main/ReviewSection';
import TheaterStatSection from '../components/main/TheaterStatSection';
import { Search, Facebook, Twitter, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const { data, loading, error } = useMainData();
  const navigate = useNavigate();

  // AI 스튜디오 제안 모던 스타일 정의
  const modernStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    
    .font-display { font-family: 'Anton', sans-serif; }
    .font-sans { font-family: 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains+Mono', monospace; }

    .btn-primary {
      background-color: #B91C1C;
      color: white;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      background-color: #991B1B;
      transform: translateY(-2px);
    }
  `;

  // 1. 로딩 상태 디자인 업데이트
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />
      <div className="w-16 h-16 border-4 border-[#B91C1C] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-display text-2xl text-[#1A1A1A] uppercase tracking-[0.4em] animate-pulse">Loading Cinema...</p>
    </div>
  );

  // 2. 에러 상태 디자인 업데이트
  if (error || !data) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />
      <div className="text-7xl text-[#B91C1C] font-display">!</div>
      <p className="font-display text-3xl text-[#1A1A1A] uppercase tracking-tight">
        {error || "ERROR: ARCHIVE NOT FOUND"}
      </p>
      <button onClick={() => window.location.reload()} className="btn-primary px-8 py-3 rounded-sm">
        Retry Connection
      </button>
    </div>
  );

  return (
    <main className="bg-white min-h-screen text-[#1A1A1A] selection:bg-[#B91C1C] selection:text-white relative overflow-x-hidden font-sans">
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />
      
      {/* 3. 모던 내비게이션 헤더 (기존 기능 유지) */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-24 flex items-center justify-between">
          {/* 로고: KINO 정체성 유지 */}
          <div className="flex flex-col leading-none cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-display text-4xl tracking-tighter text-white uppercase">Kino</span>
            <span className="font-bold text-[10px] tracking-[0.5em] text-white/60 ml-1">ARCHIVE</span>
          </div>

          {/* 내비게이션 링크 (원본 링크 기능 유지) */}
          <div className="hidden md:flex items-center gap-12">
            {[
              { label: 'Home', path: '/' },
              { label: 'Schedule', path: '/ticketing' },
              { label: 'Movies', path: '/movies' },
              { label: 'Review', path: '/mypage/movie-story' }
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.path} 
                className="text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#B91C1C] transition-all group-hover:w-full"></span>
              </a>
            ))}
            <button className="text-white/60 hover:text-white transition-colors">
              <Search size={20} />
            </button>
          </div>

          <button className="btn-primary py-2 px-8 text-sm rounded-sm" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </nav>

      {/* 4. 메인 콘텐츠 섹션 (기존 데이터 바인딩 유지) */}
      <HeroSection movies={data.heroTrailers} />

      <div className="space-y-0 pb-40">
        {/* Quick Menu: AI 디자인에 맞게 간격 조정 */}
        <div className="relative z-30">
          <QuickMenuSection />
        </div>

        {/* 각 섹션: 기존 기능과 데이터 전달 유지 */}
        <RankingSection movies={data.bookingRank} />
        
        <div className="bg-[#F8F8F8] py-20">
            <BenefitSection coupons={data.activeCoupons} />
        </div>

        <ReviewSection movies={data.bookingRank} />

        <TheaterStatSection stats={data.regionStats} />
      </div>

      {/* 5. 모던 푸터 */}
      <footer className="bg-[#F8F8F8] border-t border-black/5 py-15 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-10 mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-20">
            <div className="flex flex-col leading-none items-center md:items-start">
              <span className="font-display text-5xl tracking-tighter text-[#1A1A1A]">KINO</span>
              <span className="font-bold text-xs tracking-[0.6em] text-black/40 ml-1">CINEMA ARCHIVE</span>
            </div>

            <div className="flex flex-wrap justify-center gap-12">
              {['About', 'Support', 'Privacy', 'Contact'].map((item) => (
                <a key={item} href="#" className="text-sm font-bold uppercase tracking-widest text-black/40 hover:text-[#1A1A1A] transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-6">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-black/40 hover:bg-[#B91C1C] hover:border-[#B91C1C] hover:text-white transition-all duration-300">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 pb-16">
            <div className="flex flex-col items-center md:items-start gap-2 font-mono">
              <p>SUPPORT@KINOARCHIVE.COM</p>
              <p>+82 (02) 1234 5678</p>
            </div>
            <p>© 2026 KINO CINEMA EXHIBITIONS. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Main;