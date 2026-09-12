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

// 백엔드에서 어떤 텍스트가 오든 숫자를 감지해서 알맞은 이미지를 반환
export const resolveRatingImage = (ratingStr?: string): string => {
    if (!ratingStr) return ratingImages.ALL;
    
    const str = ratingStr.toUpperCase();
    if (str.includes('12')) return ratingImages.AGE_12;
    if (str.includes('15')) return ratingImages.AGE_15;
    if (str.includes('18') || str.includes('청불') || str.includes('ADULT')) return ratingImages.AGE_18;
    
    return ratingImages.ALL; // 위 조건에 안 맞으면 무조건 전체관람가(ALL)
};

export default ratingImages;