package com.cinema.kino.dto;

import lombok.Data;

public class GoogleDTO {
    @Data
    public static class LoginRequest {
        private String code;
    }

    @Data
    public static class GoogleTokenResponse {
        private String access_token;
        private String expires_in;
        private String scope;
        private String token_type;
        private String id_token;
    }

    @Data
    public static class GoogleUserInfoResponse {
        private String id;        // 구글의 고유 식별자(sub)
        private String email;
        private String name;
        private String picture;   // 프로필 이미지
    }
}