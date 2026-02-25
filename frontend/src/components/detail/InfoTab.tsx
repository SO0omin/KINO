import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  LineChart, Line, XAxis, CartesianGrid, Tooltip 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#222] text-white p-3 rounded-md shadow-2xl border border-zinc-700 outline-none">
        <p className="text-sm font-black mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#22d3ee] opacity-50" />
          <p className="text-xs font-bold text-zinc-300">
            일별 관객수: <span className="text-white ml-1">{payload[0].value.toLocaleString()} 명</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface InfoTabProps {
  data: {
    avgDirection: number;
    avgStory: number;
    avgVisual: number;
    avgActor: number;
    avgOst: number;
    topPoints: string;
    totalAvgRating: number;
    bookingRate: number;
    cumulativeAudience: number;
    audienceTrend: { date: string; count: number }[];
    reviews: any[];
  };
}

const InfoTab = ({ data }: InfoTabProps) => {
  // 🟢 핵심! 최근 7일을 무조건 생성하고 DB 데이터와 합치는 시크한 로직
  const processTrendData = () => {
    const result = [];
    const today = new Date();

    // 오늘부터 역순으로 7일치 날짜 리스트 생성 (6일 전 ~ 오늘)
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      
      // "MM.DD" 형식으로 포맷팅
      const formattedDate = `${String(targetDate.getMonth() + 1).padStart(2, '0')}.${String(targetDate.getDate()).padStart(2, '0')}`;
      
      // DB에서 넘어온 audienceTrend 배열에서 해당 날짜가 있는지 찾기
      const dbMatch = data.audienceTrend?.find(item => item.date === formattedDate);
      
      result.push({
        n: formattedDate, // X축에 표시될 날짜
        v: dbMatch ? dbMatch.count : 0 // 데이터 없으면 시크하게 0점(바닥선) 처리! ✨
      });
    }
    return result;
  };

  const trendData = React.useMemo(() => processTrendData(), [data.audienceTrend]);
  const radarData = React.useMemo(() => [
    { subject: '연출', A: data.avgDirection },
    { subject: '스토리', A: data.avgStory },
    { subject: '영상미', A: data.avgVisual },
    { subject: '배우', A: data.avgActor },
    { subject: 'OST', A: data.avgOst },
  ], [data]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-stretch bg-white border-y border-zinc-200 min-h-[320px] text-black shadow-sm">
        
        {/* 1. 관람포인트 섹션 */}
        <div className="flex-1 p-10 flex flex-col items-center border-r border-zinc-100">
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">관람포인트</p>
          <p className="text-3xl font-black text-[#503396] mb-4 italic">{data.topPoints || "데이터 집계 중"}</p>
          <div className="w-full h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e4e4e7" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 11, fontWeight: 'bold' }} />
                <Radar dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} isAnimationActive={true} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 실관람 평점 & 예매율 섹션 */}
        <div className="flex-1 p-10 flex flex-col items-center justify-center border-r border-zinc-100 space-y-12 bg-zinc-50/10">
          <div className="text-center">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">실관람 평점</p>
            <div className="w-24 h-24 rounded-full bg-[#503396] flex items-center justify-center shadow-xl shadow-purple-200">
              <span className="text-3xl font-black text-white">{data.totalAvgRating.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">예매율</p>
            <p className="text-4xl font-black text-[#503396] tracking-tighter">{data.bookingRate}%</p>
          </div>
        </div>

        {/* 3. 누적관객수 & 추이 차트 섹션 (0명 날짜 포함 버전) */}
        <div className="flex-1 p-10 flex flex-col items-center justify-between">
          <div className="text-center">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">누적관객수</p>
            <p className="text-4xl font-black text-zinc-900 tracking-tighter">
              {data.cumulativeAudience?.toLocaleString()} <span className="text-sm font-normal text-zinc-400">명</span>
            </p>
          </div>
          
          <div className="w-full h-40 relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="n" 
                  axisLine={{ stroke: '#e4e4e7' }} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 11 }} 
                  dy={10} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }} />
                
                <Line 
                  type="monotone" 
                  dataKey="v" 
                  stroke="#22d3ee" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#fff', stroke: '#22d3ee', strokeWidth: 2 }} 
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#22d3ee' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    {/* 2. 하단 실관람평 리스트 (관람평 쓰기 버튼 없이) */}
      <div className="bg-white py-12">
        <div className="flex justify-between items-center mb-10 border-b border-zinc-100 pb-6 text-black">
          <h3 className="text-xl font-black uppercase tracking-tighter">
            실관람평 <span className="text-purple-600 ml-2">{data.reviews?.length || 0}</span>
          </h3>
          <span className="text-xs text-zinc-400 font-bold">최근 작성된 관람평입니다.</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {data.reviews && data.reviews.length > 0 ? (
            data.reviews.slice(0, 5).map((r: any) => ( // 인포 탭이니까 상위 5개만 노출
              <div key={r.id} className="py-10 flex items-start gap-12 text-black">
                {/* 프로필 & 닉네임 */}
                <div className="flex flex-col items-center w-20 shrink-0 gap-3">
                  <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center overflow-hidden border border-zinc-100">
                    {r.profileImage && r.profileImage !== 'default' ? (
                      <img src={r.profileImage} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 text-center leading-tight">
                    {r.maskedUsername}
                  </span>
                </div>
                
                {/* 리뷰 내용 */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl font-black text-[#503396]">{r.averageScore.toFixed(1)}</span>
                    <div className="text-[10px] text-purple-400 font-bold border-l pl-3 border-zinc-100 uppercase tracking-tighter">
                      {r.topKeywords}
                    </div>
                  </div>
                  <p className="text-zinc-700 text-base leading-relaxed font-medium">{r.content}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-300 font-mono font-bold">{r.createdAt}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-zinc-300 font-bold">등록된 관람평이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoTab;