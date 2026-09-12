package com.cinema.kino.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLinkRequestDTO {
    private String provider;     // "KAKAO" or "NAVER"
    private String code;  // 프론트에서 받아온 소셜 토큰
    private String state;  // 네이버에서만 필요한 state
}