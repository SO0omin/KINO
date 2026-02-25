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
export async function getMyVouchers(memberId, voucherType, status) {
    const query = new URLSearchParams({
        memberId: String(memberId),
        voucherType,
    });
    if (status)
        query.set('status', status);
    const response = await fetch(`${API_BASE_URL}/api/mypage/vouchers?${query.toString()}`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '관람권/교환권 목록을 불러오지 못했습니다.');
    }
    return response.json();
}
export async function registerVoucher(payload) {
    const response = await fetch(`${API_BASE_URL}/api/mypage/vouchers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '관람권/교환권 등록에 실패했습니다.');
    }
    return response.json();
}
export async function getMyCoupons(memberId) {
    const response = await fetch(`${API_BASE_URL}/api/coupons/my?memberId=${memberId}&includeAll=true`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '쿠폰 목록을 불러오지 못했습니다.');
    }
    return response.json();
}
export async function redeemCoupon(memberId, code) {
    const response = await fetch(`${API_BASE_URL}/api/coupons/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, code }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '쿠폰 등록에 실패했습니다.');
    }
    return response.json();
}
export async function getMyMembershipCards(memberId) {
    const response = await fetch(`${API_BASE_URL}/api/mypage/cards?memberId=${memberId}`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '멤버십 카드 목록을 불러오지 못했습니다.');
    }
    return response.json();
}
export async function registerMembershipCard(payload) {
    const response = await fetch(`${API_BASE_URL}/api/mypage/cards/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '멤버십 카드 등록에 실패했습니다.');
    }
    return response.json();
}
export async function getMyPointHistories(memberId, from, to) {
    const query = new URLSearchParams({
        memberId: String(memberId),
        from,
        to,
    });
    const response = await fetch(`${API_BASE_URL}/api/mypage/points?${query.toString()}`);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '포인트 이용내역을 불러오지 못했습니다.');
    }
    return response.json();
}
export async function sendPointPasswordSms(memberId, phoneNumber) {
    const response = await fetch(`${API_BASE_URL}/api/mypage/point-password/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, phoneNumber }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '인증번호 발송에 실패했습니다.');
    }
    return response.json();
}
export async function verifyPointPasswordSms(memberId, phoneNumber, authCode) {
    const response = await fetch(`${API_BASE_URL}/api/mypage/point-password/sms/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, phoneNumber, authCode }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '휴대폰 인증 확인에 실패했습니다.');
    }
    return response.json();
}
export async function updatePointPassword(memberId, verificationToken, newPassword, confirmPassword) {
    const response = await fetch(`${API_BASE_URL}/api/mypage/point-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, verificationToken, newPassword, confirmPassword }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '포인트 비밀번호 설정에 실패했습니다.');
    }
    return response.json();
}
