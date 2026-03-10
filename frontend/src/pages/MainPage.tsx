import { useMainData } from '../hooks/useMainData';
import HeroSection from '../components/main/HeroSection';
import RankingSection from '../components/main/RankingSection';
import QuickMenuSection from '../components/main/QuickMenuSection';
import BenefitSection from '../components/main/BenefitSection';
import ReviewSection from '../components/main/ReviewSection';
import TheaterStatSection from '../components/main/TheaterStatSection';
import { Search, Facebook, Twitter, Instagram } from 'lucide-react';

const Main = () => {
  const { data, loading, error } = useMainData();

  const modernStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  `;

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />
      <div className="w-16 h-16 border-4 border-[#B91C1C] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-display text-2xl text-[#1A1A1A] uppercase tracking-[0.4em] animate-pulse">Loading Cinema...</p>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />
      <div className="text-7xl text-[#B91C1C]">!</div>
      <p className="font-display text-3xl text-[#1A1A1A] uppercase tracking-tight">
        {error || "ERROR: ARCHIVE NOT FOUND"}
      </p>
      <button onClick={() => window.location.reload()} className="btn-primary">
        Retry Connection
      </button>
    </div>
  );

  return (
    <main className="bg-white min-h-screen text-[#1A1A1A] selection:bg-[#B91C1C] selection:text-white relative overflow-x-hidden font-sans">
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />

      <HeroSection movies={data.heroTrailers} />

      <div className="space-y-0 pb-40">
        {/* Quick Menu */}
        <QuickMenuSection />

        {/* Ranking Section */}
        <RankingSection movies={data.bookingRank} />

        {/* Benefit Section */}
        <BenefitSection coupons={data.activeCoupons} />

        {/* Review Section */}
        <ReviewSection movies={data.bookingRank} />

        {/* Theater Stats */}
        <TheaterStatSection stats={data.regionStats} />
      </div>
    </main>
  );
};

export default Main;
