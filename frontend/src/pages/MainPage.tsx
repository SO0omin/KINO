
import { useMainData } from '../hooks/useMainData';
import HeroSection from '../components/main/HeroSection';
import RankingSection from '../components/main/RankingSection';
import QuickMenuSection from '../components/main/QuickMenuSection';
import BenefitSection from '../components/main/BenefitSection';
import ReviewSection from '../components/main/ReviewSection';
import TheaterStatSection from '../components/main/TheaterStatSection';
import FilmStrip from '../components/ticketing/FilmStrip';

const Main = () => {
  const { data, loading, error } = useMainData();

  console.log("메인 페이지 데이터:", data);

  const vintageStyles = `
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-mono { font-family: 'Courier Prime', monospace; }
    .font-typewriter { font-family: 'Special Elite', cursive; }
    
    .grainy::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.05;
      background-image: url('https://grainy-gradients.vercel.app/noise.svg');
    }

    .paper-texture {
      background-image: url('https://www.transparenttextures.com/patterns/p6.png');
    }

    .text-stroke-black {
      -webkit-text-stroke: 1px black;
      color: transparent;
    }
  `;

  if (loading) return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center gap-8 paper-texture grainy">
      <style dangerouslySetInnerHTML={{ __html: vintageStyles }} />
      <div className="w-24 h-24 border-[8px] border-black border-t-transparent rounded-full animate-spin"></div>
      <p className="font-typewriter text-xl text-black uppercase tracking-[0.4em] animate-pulse">Loading Manifest...</p>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col items-center justify-center gap-6 paper-texture grainy">
      <style dangerouslySetInnerHTML={{ __html: vintageStyles }} />
      <div className="text-6xl text-red-800">⚠</div>
      <p className="font-serif text-3xl italic text-black uppercase tracking-tighter">
        {error || "ERROR: ARCHIVE NOT FOUND"}
      </p>
      <button onClick={() => window.location.reload()} className="px-8 py-3 border-2 border-black font-mono text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all">
        Retry Connection
      </button>
    </div>
  );

  return (
    <main className="bg-[#F5F2ED] min-h-screen text-black selection:bg-black selection:text-white paper-texture grainy relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: vintageStyles }} />
      
      {/* Header / Logo Area */}
      <div className="bg-black text-white py-12 relative">
        <div className="max-w-7xl mx-auto px-10 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-20 bg-white/40"></div>
            <p className="font-mono text-sm tracking-[0.3em] text-white/60 uppercase">A MASTERPIECE IN EVERY FRAME • THE GOLDEN AGE OF CINEMA</p>
            <div className="h-px w-20 bg-white/40"></div>
          </div>
          <FilmStrip />
        </div>
      </div>

      <HeroSection movies={data.heroTrailers} />

      <div className="max-w-7xl mx-auto px-10 space-y-32 pb-40">
        {/* Quick Menu */}
        <div className="-mt-16 relative z-30">
          <QuickMenuSection />
        </div>

        {/* Ranking Section */}
        <RankingSection movies={data.bookingRank} />

        {/* Benefit Section */}
        <BenefitSection coupons={data.activeCoupons} />

        {/* Review Section */}
        <ReviewSection movies={data.bookingRank} />

        {/* Theater Stats */}
        <TheaterStatSection stats={data.regionStats} />
      </div>

      {/* Footer */}
      <footer className="bg-black text-white/40 py-24 text-center relative mt-20">
        <div className="max-w-4xl mx-auto px-10">
          <FilmStrip />
          <div className="mt-16 space-y-8 font-mono text-[10px] uppercase tracking-[0.5em]">
            <p className="font-serif text-3xl text-white italic tracking-widest lowercase mb-12">directed by you</p>
            <p>© 1928 - 2026 GOLDEN AGE CINEMA EXHIBITIONS</p>
            <p className="opacity-20 leading-loose max-w-lg mx-auto">
              THE CURTAIN FALLS, BUT THE STORY LINGERS.
              IN ASSOCIATION WITH VINTAGE FILM WORKS, INC. POWERED BY THE KINO CINE-ENGINE.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Main;
