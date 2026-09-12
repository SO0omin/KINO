package com.cinema.kino.util;

/**
 * SecurityContext의 Principal을 예약 주체(회원 / 비회원)로 해석합니다.
 *
 * JwtFilter가 넣어주는 값의 규약:
 *  - 회원   : memberId (Long)
 *  - 비회원 : "GUEST_{guestId}" (String, 토큰의 subject)
 *
 * 요청 본문의 memberId/guestId를 신뢰하면 남의 명의로 예약이 가능해지므로,
 * 예약 주체는 반드시 토큰에서만 얻습니다.
 */
public record AuthenticatedActor(Long memberId, Long guestId) {

    private static final String GUEST_PREFIX = "GUEST_";

    public static AuthenticatedActor from(Object principal) {
        if (principal instanceof Long memberId) {
            return new AuthenticatedActor(memberId, null);
        }

        if (principal instanceof String subject && subject.startsWith(GUEST_PREFIX)) {
            try {
                Long guestId = Long.parseLong(subject.substring(GUEST_PREFIX.length()));
                return new AuthenticatedActor(null, guestId);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("비회원 인증 정보가 올바르지 않습니다.");
            }
        }

        throw new IllegalArgumentException("로그인이 필요한 요청입니다.");
    }

    public boolean isGuest() {
        return guestId != null;
    }
}
