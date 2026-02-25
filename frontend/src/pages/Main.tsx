import React from 'react';
import { useMainData } from '../hooks/useMainData';
import HeroSection from '../components/main/HeroSection';
import RankingSection from '../components/main/RankingSection';
import QuickMenuSection from '../components/main/QuickMenuSection';
import BenefitSection from '../components/main/BenefitSection';
import ReviewSection from '../components/main/ReviewSection';
import TheaterStatSection from '../components/main/TheaterStatSection';

const Main = () => {
  const { data, loading, error } = useMainData();

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono italic text-purple-500 animate-pulse">
      KINO LOADING...
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-red-500 font-mono italic">
      {error || "ERROR: DATA NOT FOUND"}
    </div>
  );

  return (
    <main className="bg-[#0a0a0a] min-h-screen text-white selection:bg-purple-500/30">
      <HeroSection movies={data.heroTrailers} />

      {/* 랭킹 섹션 */}
      <div className="max-w-7xl mx-auto px-6 mt-20">
        <RankingSection movies={data.bookingRank} />
      </div>

      {/* 퀵 메뉴 섹션 */}
      <div className="mb-24">
        <QuickMenuSection />
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-24 pb-40">
        {/* 쿠폰 섹션 */}
        <BenefitSection coupons={data.activeCoupons} />
        {/* 리뷰 섹션 */}
        <ReviewSection movies={data.bookingRank} />
        {/* 상영관 개수 섹션 */}
        <TheaterStatSection stats={data.regionStats} />
      </div>
    </main>
  );
};

export default Main;