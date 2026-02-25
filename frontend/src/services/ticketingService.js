import { ticketingApi } from '../api/ticketingApi';
export const ticketingService = {
    // 1. 지역 목록 가져오기 (ID 순 정렬)
    async getSortedRegions() {
        const res = await ticketingApi.getRegions();
        return [...res.data].sort((a, b) => a.id - b.id);
    },
    // 2. 통합 시간표(Manifest) 조회 및 필터링
    async getScreeningManifest(theaterIds, movieIds, date, activeTab) {
        if (theaterIds.length === 0 && movieIds.length === 0)
            return [];
        const typeFilter = activeTab === 'SPECIAL' ? 'SPECIAL' : null;
        const res = await ticketingApi.getScreenings(theaterIds, movieIds, date, typeFilter);
        return res.data;
    },
    // 3. 사용 가능한 영화/영화관 ID 필터링 (간편화를 위해 랩핑)
    async getAvailableMovieIds(theaterIds, date, activeTab, specialType) {
        let colorFilter = null;
        if (activeTab === 'SPECIAL') {
            colorFilter = theaterIds.length > 0 ? 'SPECIAL' : (specialType || 'SPECIAL');
        }
        const res = await ticketingApi.getAvailableMovieIds(theaterIds, date, colorFilter);
        return res.data;
    }
};
