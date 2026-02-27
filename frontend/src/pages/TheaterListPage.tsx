import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Info } from 'lucide-react';
import axios from 'axios';

// 타입 정의
interface Region {
  id: number;
  name: string;
}

interface Theater {
  id: number;
  name: string;
  regionId: number;
  address?: string;
}

const TheaterListPage = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [regions, setRegions] = useState<Region[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 데이터 페칭 (실제 API 경로에 맞게 수정하세요)
    useEffect(() => {
    const fetchTheatersData = async () => {
      try {
        // 백엔드 API 동시 호출 (Promise.all로 병렬 처리해서 속도를 높임)
        const [regionsRes, theatersRes] = await Promise.all([
          axios.get('/api/regions'),
          axios.get('/api/theaters')
        ]);

        setRegions(regionsRes.data);
        setTheaters(theatersRes.data);
        
        // 지역 데이터가 있으면 첫 번째 지역을 기본 탭으로 선택
        if (regionsRes.data.length > 0) {
          setSelectedRegionId(regionsRes.data[0].id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("극장 데이터를 불러오는데 실패했습니다.", error);
        setLoading(false);
      }
    };

    fetchTheatersData();
  }, []);

  // 선택된 지역에 속한 극장만 필터링
  const filteredTheaters = theaters.filter(t => t.regionId === selectedRegionId);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea]">Loading...</div>;

  return (
    <div className="bg-[#f4f1ea] min-h-screen text-black pb-20">
      {/* 헤더 섹션 */}
      <div className="bg-black text-white pt-16 pb-12 text-center relative border-b-8 border-red-800">
        <h1 className="font-serif text-5xl italic tracking-widest uppercase mb-4">Theaters</h1>
        <p className="font-mono text-sm tracking-[0.3em] text-white/60">Find your nearest Kino Cinema</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        {/* 지역 탭 섹션 (메가박스 스타일) */}
        <div className="flex border-[3px] border-black bg-white mb-10 shadow-[8px_8px_0_0_#000]">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegionId(region.id)}
              className={`flex-1 py-4 text-center font-bold font-mono tracking-widest uppercase border-r-[3px] border-black last:border-r-0 transition-all ${
                selectedRegionId === region.id
                  ? 'bg-black text-white'
                  : 'hover:bg-[#e6dcc5] text-black'
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>

        {/* 극장 목록 그리드 */}
        <div className="bg-white border-[3px] border-black p-8 shadow-[8px_8px_0_0_#000]">
          <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-black/10">
            <h2 className="font-serif text-3xl italic font-bold">
              {regions.find(r => r.id === selectedRegionId)?.name} <span className="text-xl text-black/50 not-italic font-sans ml-2">({filteredTheaters.length})</span>
            </h2>
          </div>

          {filteredTheaters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTheaters.map((theater) => (
                <div 
                  key={theater.id}
                  className="group border-2 border-black p-6 hover:bg-black hover:text-white transition-colors cursor-pointer flex flex-col justify-between"
                  onClick={() => navigate(`/theater/${theater.id}`)}
                >
                  <div>
                    <h3 className="text-2xl font-bold mb-3 tracking-tighter group-hover:italic font-serif">{theater.name}</h3>
                    <div className="flex items-start gap-2 text-sm text-black/60 group-hover:text-white/70 mb-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="font-mono text-xs">{theater.address || '주소 정보 업데이트 중'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 py-2 border border-black group-hover:border-white font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-red-800 hover:text-white hover:border-red-800 transition-colors">
                      예매하기
                    </button>
                    <button className="px-3 border border-black group-hover:border-white flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
              <span className="font-serif text-5xl text-black/20 italic mb-4">?</span>
              <p className="font-mono text-black/50 tracking-widest">해당 지역에 등록된 극장이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheaterListPage;