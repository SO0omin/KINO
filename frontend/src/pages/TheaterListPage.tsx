import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, } from 'lucide-react'; //Info
import axios from 'axios';

// 타입 정의
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
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);

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
          // '서울' 지역을 우선적으로 찾고, 없으면 첫 번째 지역 선택
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

  // 💡 타입 불일치 방지를 위한 String 비교 필터링
  const filteredTheaters = theaters.filter(t => String(t.regionId) === String(selectedRegionId));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fdf4e3] font-mono">LOADING...</div>;

  return (
    <div className="bg-[#fdf4e3] min-h-screen text-gray-800 pb-20">
      
      {/* 헤더 섹션: Signup/Timetable과 통일 */}
      <div className="text-center pt-20 mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">THEATERS</h1>
        <p className="text-gray-600 font-medium">가까운 키노 시네마를 찾아보세요.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* 지역 선택 탭: 오렌지 레드 포인트 적용 */}
        <div className="flex w-full mb-8 bg-white rounded-t-xl overflow-hidden shadow-sm border-b border-gray-100">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegionId(region.id)}
              className={`flex-1 py-4 text-lg font-bold transition-all border-b-4 ${
                String(selectedRegionId) === String(region.id)
                  ? 'border-[#eb4d32] text-[#eb4d32] bg-white'
                  : 'border-transparent text-gray-400 bg-gray-50 hover:text-gray-600'
              }`}
            >
              {region.name}
            </button>
          ))}
        </div>

        {/* 극장 목록 섹션: 카드 스타일 적용 */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
            <h2 className="text-2xl font-bold text-gray-800">
              {regions.find(r => String(r.id) === String(selectedRegionId))?.name} 
              <span className="text-lg text-gray-400 font-medium ml-3">({filteredTheaters.length})</span>
            </h2>
          </div>

          {filteredTheaters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTheaters.map((theater) => (
                <div 
                  key={theater.id}
                  className="group bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-orange-100 transition-all cursor-pointer flex flex-col justify-between"
                  onClick={() => navigate(`/theater/${theater.id}`)}
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#eb4d32] transition-colors">
                      {theater.name}
                    </h3>
                    <div className="flex items-start gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                      <p className="leading-relaxed">{theater.address || '주소 정보 업데이트 중'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-3">
                    <button 
                      className="flex-1 py-3 bg-[#eb4d32] text-white font-bold rounded-lg hover:bg-[#d4452d] transition-colors text-sm"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        navigate('/ticketing', { 
                          state: {
                            theaterId: theater.id,
                            regionId: theater.regionId
                          } 
                        });
                      }}
                    >
                      예매하기
                    </button>
                    {/*<button 
                      className="px-4 py-3 border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-50 hover:text-gray-600 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 극장 상세 정보 모달이나 페이지로 이동 로직 추가 가능
                      }}
                    >
                      <Info className="w-5 h-5" />
                    </button>*/}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-300 mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <p className="text-gray-400 font-medium">해당 지역에 등록된 극장이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheaterListPage;