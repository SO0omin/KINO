
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  LineChart, Line, XAxis, CartesianGrid, Tooltip 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-black p-3 shadow-[8px_8px_0_0_#000] border-2 border-black font-mono text-xs">
        <p className="font-bold mb-1 uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-800" />
          <p className="font-bold">
            ATTENDANCE: <span className="ml-1">{payload[0].value.toLocaleString()}</span>
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
  const processTrendData = () => {
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const formattedDate = `${String(targetDate.getMonth() + 1).padStart(2, '0')}.${String(targetDate.getDate()).padStart(2, '0')}`;
      const dbMatch = data.audienceTrend?.find(item => item.date === formattedDate);
      result.push({
        n: formattedDate,
        v: dbMatch ? dbMatch.count : 0
      });
    }
    return result;
  };

  const trendData = React.useMemo(() => processTrendData(), [data.audienceTrend]);
  const radarData = React.useMemo(() => [
    { subject: 'DIRECTION', A: data.avgDirection },
    { subject: 'STORY', A: data.avgStory },
    { subject: 'VISUALS', A: data.avgVisual },
    { subject: 'ACTING', A: data.avgActor },
    { subject: 'MUSIC', A: data.avgOst },
  ], [data]);

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {/* Stats Grid - Vintage Ledger Style */}
      <div className="flex flex-col lg:flex-row items-stretch border-[6px] border-black bg-white shadow-[16px_16px_0_0_#000] overflow-hidden">
        
        {/* 1. Critical Analysis */}
        <div className="flex-1 p-10 flex flex-col items-center border-b lg:border-b-0 lg:border-r-[4px] border-black/10">
          <p className="font-typewriter text-[10px] text-black/40 uppercase tracking-[0.4em] mb-4">Critical Analysis</p>
          <h4 className="font-serif text-2xl italic text-black mb-6 uppercase tracking-tight">{data.topPoints || "Analyzing..."}</h4>
          <div className="w-full h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#000" strokeOpacity={0.1} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 10, fontWeight: 'bold', fontFamily: 'Courier Prime' }} />
                <Radar dataKey="A" stroke="#991b1b" fill="#991b1b" fillOpacity={0.2} isAnimationActive={true} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Public Reception */}
        <div className="flex-1 p-10 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r-[4px] border-black/10 bg-[#f4f1ea]/30 space-y-12">
          <div className="text-center">
            <p className="font-typewriter text-[10px] text-black/40 uppercase tracking-[0.4em] mb-6">Audience Rating</p>
            <div className="w-28 h-28 rounded-full border-[6px] border-black flex items-center justify-center bg-white shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]">
              <span className="font-serif text-4xl font-black italic text-black">{data.totalAvgRating.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-typewriter text-[10px] text-black/40 uppercase tracking-[0.4em] mb-2">Booking Rate</p>
            <p className="font-mono text-5xl font-black text-black tracking-tighter">{data.bookingRate}%</p>
          </div>
        </div>

        {/* 3. Box Office Trend */}
        <div className="flex-1 p-10 flex flex-col items-center justify-between">
          <div className="text-center">
            <p className="font-typewriter text-[10px] text-black/40 uppercase tracking-[0.4em] mb-2">Total Attendance</p>
            <p className="font-serif text-4xl font-black italic text-black tracking-tighter">
              {data.cumulativeAudience?.toLocaleString()} <span className="text-xs font-mono not-italic text-black/40 uppercase ml-1">Patrons</span>
            </p>
          </div>
          
          <div className="w-full h-44 relative mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" strokeOpacity={0.05} />
                <XAxis 
                  dataKey="n" 
                  axisLine={{ stroke: '#000', strokeOpacity: 0.2 }} 
                  tickLine={false} 
                  tick={{ fill: '#000', opacity: 0.4, fontSize: 10, fontFamily: 'Courier Prime' }} 
                  dy={10} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#000', strokeWidth: 1, strokeOpacity: 0.1 }} />
                
                <Line 
                  type="stepAfter" 
                  dataKey="v" 
                  stroke="#991b1b" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#fff', stroke: '#991b1b', strokeWidth: 2 }} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#991b1b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reviews - Ticket Style */}
      <div className="bg-white border-[6px] border-black p-10 shadow-[16px_16px_0_0_#000]">
        <div className="flex justify-between items-end mb-12 border-b-2 border-black pb-6">
          <div className="space-y-2">
            <span className="font-typewriter text-[10px] text-black/40 tracking-[0.5em] uppercase">Patron Testimonials</span>
            <h3 className="font-serif text-4xl italic tracking-tighter text-black uppercase">
              Recent <span className="bg-black text-white px-3">Entries</span>
            </h3>
          </div>
          <span className="font-mono text-[10px] font-bold text-black/40 uppercase tracking-widest">Verified Attendance Only</span>
        </div>

        <div className="space-y-8">
          {data.reviews && data.reviews.length > 0 ? (
            data.reviews.slice(0, 5).map((r: any, i: number) => (
              <div key={r.id} className="relative flex items-start gap-12 p-8 border-2 border-black bg-[#f4f1ea]/20 group hover:bg-[#f4f1ea]/50 transition-colors">
                {/* Ticket Notch Effect */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F5F2ED] border-2 border-black"></div>
                
                {/* Profile */}
                <div className="flex flex-col items-center w-24 shrink-0 gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-black bg-white flex items-center justify-center overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
                    {r.profileImage && r.profileImage !== 'default' ? (
                      <img src={r.profileImage} alt="profile" className="w-full h-full object-cover grayscale" />
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    )}
                  </div>
                  <span className="font-mono text-[9px] font-bold text-black/40 text-center leading-tight uppercase tracking-tighter">
                    {r.maskedUsername}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-6 mb-4">
                    <span className="font-serif text-4xl font-black italic text-black">{r.averageScore.toFixed(1)}</span>
                    <div className="font-typewriter text-[10px] text-red-800 font-bold border-l-2 pl-4 border-black/10 uppercase tracking-widest">
                      {r.topKeywords}
                    </div>
                  </div>
                  <p className="font-serif italic text-xl text-black/80 leading-relaxed">"{r.content}"</p>
                </div>

                <div className="text-right self-start">
                  <span className="font-mono text-[10px] text-black/20 font-bold uppercase tracking-widest">{r.createdAt}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-black/10">
              <p className="font-serif italic text-2xl text-black/20 uppercase tracking-tighter">No entries found in archive</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoTab;
