export const mapRatingToStyle = (rating: string) => {
  const r = (rating || "").toLowerCase().replace('age_', '').trim();
  let color = 'bg-[#4a4a4a]';
  let text = r.toUpperCase();

  if (r === 'all') { color = 'bg-[#1a5f2e]'; text = 'ALL'; } 
  else if (r === '12') { color = 'bg-[#c99000]'; text = '12'; } 
  else if (r === '15') { color = 'bg-[#a35200]'; text = '15'; } 
  else if (r === '18') { color = 'bg-[#7d1a1a]'; text = '18'; }

  return { color, text };
  
};

export const getSeatColor = (status: string) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-[#2c2c2c] border-black';
    case 'HELD': return 'bg-[#70299d] border-[#4b1b6b]';
    case 'RESERVED': return 'bg-[#dcdcd7] border-gray-400 opacity-40';
    default: return 'bg-gray-100';
  }
};

export const getRatingDetails = (rating: string) => {
  const r = (rating || "").toUpperCase().replace('AGE_', '').trim();

  const base = {
    'ALL': { 
      label: '전체', color: 'bg-[#22b14c]', textColor: 'text-green-500',
      highlight: '전체관람가', suffix: ' 영화입니다.', desc: '모든 연령의 고객님이 관람 가능한 영화입니다.' 
    },
    '12': { 
      label: '12', color: 'bg-[#ffc20e]', textColor: 'text-[#ffc20e]',
      highlight: '12세 이상 관람가', suffix: ' 영화입니다.', 
      desc: '12세 미만 고객님(영, 유아 포함)은 반드시 성인 보호자 동반 하에 관람이 가능합니다.\n연령 확인 불가 시 입장이 제한될 수 있습니다.' 
    },
    '15': { 
      label: '15', color: 'bg-[#f57c00]', textColor: 'text-[#f57c00]',
      highlight: '15세 이상 관람가', suffix: ' 영화입니다.', 
      desc: '15세 미만 고객님(영, 유아 포함)은 반드시 성인 보호자 동반 하에 관람이 가능합니다.\n연령 확인 불가 시 입장이 제한될 수 있습니다.' 
    },
    '18': { 
      label: '19', color: 'bg-[#d32f2f]', textColor: 'text-[#d32f2f]',
      highlight: '19세 미만 관람 불가', suffix: '', 
      desc: '보호자 동반 하여도 관람이 불가합니다. (반드시 신분증 지참)\n연령 확인 불가 시 입장이 제한될 수 있습니다.' 
    }
  };
  
  return base[r as keyof typeof base] || { 
    label: '-', color: 'bg-gray-400', textColor: 'text-gray-400', 
    highlight: '등급 정보 없음', suffix: '', desc: '' 
  };
};