export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // 요일 구하기 (일~토)
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = week[date.getDay()];

  // 연.월.일 형식
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}(${dayOfWeek})`;
};

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  
  // 24시간 형식
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};