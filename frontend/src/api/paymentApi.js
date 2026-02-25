const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
export async function getReservationDetail(reservationId) {
    const response = await fetch(`${API_BASE_URL}/api/payments/${reservationId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        throw new Error('예약 정보를 불러오는데 실패했습니다. (시간 초과되었거나 존재하지 않는 예약입니다)');
    }
    return response.json();
}
export async function preparePayment(request) {
    const response = await fetch(`${API_BASE_URL}/api/payments/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '결제 준비 중 오류가 발생했습니다.');
    }
    return response.json();
}
export async function confirmPayment(request) {
    const response = await fetch(`${API_BASE_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '최종 결제 승인에 실패했습니다. 고객센터에 문의해주세요.');
    }
    return response.json();
}
export async function redeemCoupon(code, memberId) {
    const response = await fetch(`${API_BASE_URL}/api/coupons/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, memberId }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '쿠폰 등록 실패');
    }
    return response.json();
}
export async function getMyCoupons(memberId) {
    const response = await fetch(`${API_BASE_URL}/api/coupons/my?memberId=${memberId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '쿠폰 목록 조회 실패');
    }
    return response.json();
}
export async function getMyPoints(memberId) {
    const response = await fetch(`${API_BASE_URL}/api/points?memberId=${memberId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok)
        return 0;
    return response.json();
}
