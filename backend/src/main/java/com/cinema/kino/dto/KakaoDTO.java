package com.cinema.kino.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

public class KakaoDTO {

    // 1. 프론트에서 넘어오는 코드
    @Getter
    public static class LoginRequest {
        private String code;
    }

    // 2. 카카오 토큰 응답
    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KakaoTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;
    }

    // 3. 카카오 유저 정보 응답
    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KakaoUserInfoResponse {
        private Long id;
        @JsonProperty("kakao_account")
        private KakaoAccount kakaoAccount;

        @Getter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class KakaoAccount {
            private String email;
            private Profile profile;
        }

        @Getter
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Profile {
            private String nickname;

            // 💡 이 줄을 추가하세요! (카카오에서 주는 프로필 이미지 URL)
            @JsonProperty("profile_image_url")
            private String profileImageUrl;
        }
    }
}