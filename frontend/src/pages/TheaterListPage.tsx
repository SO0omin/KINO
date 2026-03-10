import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import FilmStrip from '../components/ticketing/FilmStrip';

// --- 타입 정의 (원본 유지) ---
interface Region {
  id: number | string;
  name: string;
}

interface Theater {
  id: number | string;
  name: string;
  regionId: number | string;
  address?: string;
}

const TheaterListPage = () => {
  const navigate = useNavigate();
  
  // --- 상태 관리 (원본 로직 유지) ---
  const [regions, setRegions] = useState<Region[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 모던 스타일 정의 ---
  const modernStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap');
    .font-display { font-family: 'Anton', sans-serif; }
    .font-sans { font-family: 'Inter', sans-serif; }
  `;

  // --- 데이터 패칭 (원본 로직 유지) ---
  useEffect(() => {
    const fetchTheatersData = async () => {
      try {
        const [regionsRes, theatersRes] = await Promise.all([
          axios.get('/api/theaters/regions'),
          axios.get('/api/theaters')
        ]);

        setRegions(regionsRes.data);
        setTheaters(theatersRes.data);
        
        if (regionsRes.data.length > 0) {
          // '서울' 지역 우선 선택 로직 유지
          const seoul = regionsRes.data.find((r: Region) => r.name.includes('서울')) || regionsRes.data[0];
          setSelectedRegionId(seoul.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("극장 데이터를 불러오는데 실패했습니다.", error);
        setLoading(false);
      }
    };

    fetchTheatersData();
  }, []);

  // 💡 타입 불일치 방지를 위한 필터링 (원본 유지)
  const filteredTheaters = theaters.filter(t => String(t.regionId) === String(selectedRegionId));

  // 1. 로딩 상태 디자인
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />
      <div className="w-16 h-16 border-4 border-[#B91C1C] border-t-transparent rounded-full animate-spin"></div>
      <p className="font-display text-2xl text-[#1A1A1A] uppercase tracking-[0.4em] animate-pulse font-sans">Loading Archives...</p>
    </div>
  );

  return (
    <div className="bg-white text-[#1A1A1A] min-h-screen font-sans selection:bg-[#B91C1C] selection:text-white pb-40">
      <style dangerouslySetInnerHTML={{ __html: modernStyles }} />
      
      {/* 2. 헤더 섹션 (AI 스튜디오 스타일) */}
      <div className="bg-[#1A1A1A] text-white pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#B91C1C_0%,transparent_70%)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-[#B91C1C]"></div>
              <p className="font-mono text-[10px] font-bold tracking-[0.5em] text-[#B91C1C] uppercase">Kino Network</p>
              <div className="h-px w-12 bg-[#B91C1C]"></div>
            </div>
            <h1 className="font-display text-4xl md:text-4xl uppercase tracking-tighter leading-none">
              키노 <span className="text-white/20">시네마</span>
            </h1>
            <p className="text-white/20">가까운 키노 시네마를 찾아보세요.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        
        {/* 3. 지역 선택 탭 (모던 스타일) */}
        <div className="flex flex-wrap w-full mb-16 bg-[#FDFDFD] border border-black/5 rounded-sm overflow-hidden shadow-xl">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegionId(region.id)}
              className={`flex-1 min-w-[120px] py-6 text-sm font-bold transition-all border-b-2 ${
                String(selectedRegionId) === String(region.id)
                  ? 'border-[#B91C1C] text-[#B91C1C] bg-white' // 💡 bg-[#1A1A1A] 제거
                  : 'border-transparent text-black/40 hover:bg-black/5'
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>

        {/* 4. 극장 리스트 영역 */}
        <div className="space-y-12">
          {/* 현재 지역 요약 헤더 */}
          <div className="flex items-end justify-between border-b-2 border-black pb-6">
            <div className="space-y-2">
              <span className="text-[#B91C1C] font-bold tracking-[0.2em] uppercase text-[10px]">Location Selected</span>
              <h2 className="font-display text-4xl md:text-5xl uppercase tracking-tight">
                {regions.find(r => String(r.id) === String(selectedRegionId))?.name} 
                <span className="text-black/10 ml-4 font-sans italic">{filteredTheaters.length} Venues</span>
              </h2>
            </div>
          </div>

          {/* 극장 그리드 (애니메이션 적용) */}
          <AnimatePresence mode="wait">
            {filteredTheaters.length > 0 ? (
              <motion.div 
                key={selectedRegionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredTheaters.map((theater, idx) => (
                  <div 
                    key={theater.id}
                    className="group relative bg-[#FDFDFD] border border-black/5 p-8 rounded-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-[#B91C1C]/30 flex flex-col justify-between overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/theater/${theater.id}`)}
                  >
                    {/* 배경 장식 아이콘 */}
                    <MapPin size={100} className="absolute -right-6 -top-6 text-black/[0.02] group-hover:text-[#B91C1C]/5 transition-colors duration-500 rotate-12" />

                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 bg-black/5 rounded-sm flex items-center justify-center text-[#B91C1C] group-hover:bg-[#B91C1C] group-hover:text-white transition-all duration-500">
                          <MapPin size={20} />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-black/20 uppercase tracking-widest">Venue 0{idx + 1}</span>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-display text-3xl text-[#1A1A1A] uppercase tracking-tight group-hover:text-[#B91C1C] transition-colors leading-none">
                          {theater.name}
                        </h3>
                        <p className="text-black/40 text-sm font-medium leading-relaxed min-h-[3rem]">
                          {theater.address || '주소 정보를 업데이트 중인 아카이브입니다.'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-10 relative z-10">
                      <button 
                        className="w-full py-4 bg-[#1A1A1A] text-white font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#B91C1C] transition-colors shadow-lg flex items-center justify-center gap-3"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          navigate('/ticketing', { 
                            state: { theaterId: theater.id, regionId: theater.regionId } 
                          });
                        }}
                      >
                        <Ticket size={16} />
                        <span>예매하기</span>
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-40 flex flex-col items-center justify-center text-center space-y-6 opacity-20"
              >
                <div className="w-24 h-24 border-2 border-dashed border-black rounded-full flex items-center justify-center">
                  <MapPin size={40} />
                </div>
                <p className="font-display text-2xl uppercase tracking-tight">해당 지역에 등록된 극장이 없습니다.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TheaterListPage;