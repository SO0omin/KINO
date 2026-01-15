import ALL from '../assets/all.png';
import AGE_12 from '../assets/age_12.png';
import AGE_15 from '../assets/age_15.png';
import AGE_18 from '../assets/age_18.png';

// 등급에 대한 타입 정의 (Union Type)
// 백엔드 Enum에서 넘어오는 정확한 문자열들을 정의합니다.
export type AgeRatingType = 'ALL' | 'AGE_12' | 'AGE_15' | 'AGE_18';

//매핑 객체 생성
const ratingImages: Record<AgeRatingType, string> = {
    ALL,
    AGE_12,
    AGE_15,
    AGE_18,
};

export default ratingImages;