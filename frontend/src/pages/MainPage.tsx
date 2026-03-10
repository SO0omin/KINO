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
      
      {/* 4. 메인 콘텐츠 섹션 (기존 데이터 바인딩 유지) */}
      <HeroSection movies={data.heroTrailers} />

      <div className="space-y-0 pb-40">
        {/* Quick Menu: AI 디자인에 맞게 간격 조정 */}
        <div className="relative z-30">
          <QuickMenuSection />
        </div>

        {/* 각 섹션: 기존 기능과 데이터 전달 유지 */}
        <RankingSection movies={data.bookingRank} />

        <div className="border-y border-black/5 bg-white">
            <BenefitSection coupons={data.activeCoupons} />
        </div>

        <ReviewSection movies={data.bookingRank} />

        <TheaterStatSection stats={data.regionStats} />
      </div>

    </main>
  );
};

export default Main;