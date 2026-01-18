/**
 * 날짜 객체를 YYYY-MM-DD 형식의 로컬 문자열로 변환
 */
export const getLocalDateString = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

/**
 * 오늘부터 count일만큼의 날짜 리스트 생성
 */
export const generateDateList = (count: number = 30) => {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      fullDate: getLocalDateString(d),
      dateNum: d.getDate(),
      dayName: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.getDay()],
      isWeekend: d.getDay() === 0,
      isSaturday: d.getDay() === 6,
    };
  });
};