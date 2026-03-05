package com.cinema.kino.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

public class NaverDTO {

    @Data
    public static class LoginRequest {
        private String code;
        private String state;
    }

    @Data
    public static class NaverTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;
        @JsonProperty("refresh_token")
        private String refreshToken;
        @JsonProperty("token_type")
        private String tokenType;
        @JsonProperty("expires_in")
        private String expiresIn;

        private String error;
        @JsonProperty("error_description")
        private String errorDescription;
    }

    @Data
    public static class NaverUserInfoResponse {
        private String resultCode;
        private String message;
        private Response response;

        @Data
        public static class Response {
            private String id;

            @JsonProperty("profile_image") // 💡 네이버가 주는 데이터를 자바 변수명에 맞게 매핑
            private String profileImage;

            private String name;
            private String email;
            private String mobile;
            private String birthday;
            private String birthyear;
        }
    }
}