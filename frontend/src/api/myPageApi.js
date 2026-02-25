const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
export async function getMyPageSummary(memberId) {
    const response = await fetch(`${API_BASE_URL}/api/mypage/summary?memberId=${memberId}`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '마이페이지 요약 정보를 불러오지 못했습니다.');
    }
    return response.json();
}
export async function getMyReservations(memberId) {
    const response = await fetch(`${API_BASE_URL}/api/mypage/reservations?memberId=${memberId}`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '예매 내역을 불러오지 못했습니다.');
    }
    return response.json();
}
export async function cancelReservation(memberId, reservationId, reason = '사용자 요청 취소') {
    const response = await fetch(`${API_BASE_URL}/api/mypage/reservations/${reservationId}/cancel?memberId=${memberId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '환불 처리에 실패했습니다.');
    }
    return response.json();
}
