import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  LineChart, Line, XAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { motion } from 'framer-motion';
import { Star, Clock, Users, Quote } from 'lucide-react';

// --- 💡 차트 커스텀 툴팁 (디자인 업그레이드) ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] text-white p-4 shadow-2xl rounded-sm border border-white/10 font-sans text-xs">
        <p className="font-bold mb-2 uppercase tracking-widest text-[#B91C1C] border-b border-white/10 pb-1">{label}</p>
        <div className="flex items-center gap-2">
          <Users size={12} className="text-white/60" />
          <p className="font-bold">
            관람객 수: <span className="ml-1 text-white">{payload[0].value.toLocaleString()}명</span>
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
  // --- 💡 원본 데이터 프로세싱 로직 유지 ---
  const processTrendData = () => {
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const formattedDate = `${String(targetDate.getMonth() + 1).padStart(2, '0')}.${String(targetDate.getDate()).padStart(2, '0')}`;
      const dbMatch = data.audienceTrend?.find(item => item.date === formattedDate);
      result.push({ n: formattedDate, v: dbMatch ? dbMatch.count : 0 });
    }
    return result;
  };

  const trendData = React.useMemo(() => processTrendData(), [data.audienceTrend]);
  const radarData = React.useMemo(() => [
    { subject: '감독연출', A: data.avgDirection },
    { subject: '스토리', A: data.avgStory },
    { subject: '영상미', A: data.avgVisual },
    { subject: '배우연기', A: data.avgActor },
    { subject: 'OST', A: data.avgOst },
  ], [data]);

  return (
    <div className="max-w-7xl mx-auto space-y-24 font-sans">
      
      {/* 1. Stats Grid - Modern Archive Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 border border-black/5 bg-white shadow-2xl rounded-sm overflow-hidden">
        
        {/* 1-1. Critical Analysis (Radar Chart) */}
        <div className="p-12 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-black/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-8 bg-[#B91C1C]"></div>
            <p className="font-mono text-[10px] font-bold text-[#B91C1C] uppercase tracking-[0.5em]">평가 지표</p>
          </div>
          <h4 className="font-display text-3xl text-[#1A1A1A] mb-10 uppercase tracking-tight text-center">
            {data.topPoints || "데이터 분석 중..."}
          </h4>
          <div className="w-full h-64 relative font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#000" strokeOpacity={0.05} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#1A1A1A', fontSize: 10, fontWeight: '700' }} />
                <Radar dataKey="A" stroke="#B91C1C" fill="#B91C1C" fillOpacity={0.1} isAnimationActive={true} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 1-2. Public Reception (Score & Rate) */}
        <div className="p-12 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-black/5 bg-[#FDFDFD] space-y-16">
          <div className="text-center space-y-8">
            <p className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-[0.5em]">관람객 평점</p>
            <div className="w-32 h-32 rounded-full border border-black/5 flex items-center justify-center bg-white shadow-xl relative group">
              {/* 회전하는 데코레이션 링 */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#B91C1C]/20 animate-[spin_20s_linear_infinite]"></div>
              <span className="font-display text-5xl text-[#1A1A1A]">{data.totalAvgRating.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-center space-y-4">
            <p className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-[0.5em]">예매율</p>
            <p className="font-display text-6xl text-[#B91C1C] tracking-tighter">{data.bookingRate}%</p>
          </div>
        </div>

        {/* 1-3. Box Office Trend (Line Chart) */}
        <div className="p-12 flex flex-col items-center justify-between space-y-12">
          <div className="text-center space-y-4">
            <p className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-[0.5em]">누적 관람객</p>
            <p className="font-display text-5xl text-[#1A1A1A] tracking-tighter">
              {data.cumulativeAudience?.toLocaleString()} <span className="text-xs font-mono text-black/20 uppercase ml-2">Patrons</span>
            </p>
          </div>
          
          <div className="w-full h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" strokeOpacity={0.03} />
                <XAxis 
                  dataKey="n" 
                  axisLine={{ stroke: '#000', strokeOpacity: 0.1 }} 
                  tickLine={false} 
                  tick={{ fill: '#1A1A1A', opacity: 0.3, fontSize: 9, fontWeight: 'bold' }} 
                  dy={10} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#B91C1C', strokeWidth: 1, strokeOpacity: 0.2 }} />
                <Line 
                  type="monotone" 
                  dataKey="v" 
                  stroke="#B91C1C" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#fff', stroke: '#B91C1C', strokeWidth: 2 }} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#B91C1C' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Recent Reviews - Modern List Style */}
      <div className="space-y-12">
        <div className="flex justify-between items-end border-b border-black/5 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-[#B91C1C]"></div>
              <span className="font-mono text-[10px] font-bold text-[#B91C1C] tracking-[0.5em] uppercase">실제 관람 후기</span>
            </div>
            <h3 className="font-display text-5xl uppercase tracking-tighter text-[#1A1A1A]">
              Recent <span className="text-black/10">Entries</span>
            </h3>
          </div>
          <span className="font-mono text-[10px] font-bold text-black/20 uppercase tracking-widest">실관람객 인증 리뷰</span>
        </div>

        <div className="grid grid-cols-1 gap-8 font-sans">
          {data.reviews && data.reviews.length > 0 ? (
            data.reviews.slice(0, 5).map((r: any) => (
              <motion.div 
                key={r.id} 
                whileHover={{ x: 10 }}
                className="group flex flex-col md:flex-row items-center gap-10 p-10 bg-white border border-black/5 rounded-sm shadow-sm hover:shadow-xl transition-all duration-500"
              >
                {/* Profile */}
                <div className="flex flex-col items-center w-28 shrink-0 gap-4">
                  <div className="w-20 h-20 rounded-full border border-black/5 bg-[#FDFDFD] flex items-center justify-center overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-500">
                    {r.profileImage && r.profileImage !== 'default' ? (
                      <img src={r.profileImage} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-black/5 flex items-center justify-center text-black/20">
                        <Users size={32} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-[9px] font-bold text-black/40 text-center uppercase tracking-tighter">
                    {r.maskedUsername}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] font-bold text-black/20 uppercase tracking-widest mb-1">SCORE</span>
                      <span className="font-display text-4xl text-[#1A1A1A]">{r.averageScore.toFixed(1)}</span>
                    </div>
                    <div className="h-10 w-px bg-black/5"></div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] font-bold text-[#B91C1C] uppercase tracking-widest mb-2">Highlights</span>
                      <div className="flex flex-wrap gap-2">
                        {r.topKeywords?.split('·').map((k: string) => (
                          <span key={k} className="font-mono text-[9px] font-bold text-black/40 border border-black/5 px-2 py-1 uppercase bg-black/5">{k.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xl text-[#1A1A1A]/70 leading-relaxed font-medium italic">"{r.content}"</p>
                </div>

                <div className="text-right self-start md:self-center font-mono">
                  <span className="font-bold text-[10px] text-black/10 uppercase tracking-widest">{r.createdAt}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center border border-dashed border-black/10 rounded-sm">
              <p className="font-display text-3xl text-black/10 uppercase tracking-tight">No archival records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoTab;