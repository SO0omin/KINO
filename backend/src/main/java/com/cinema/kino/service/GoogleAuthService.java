package com.cinema.kino.service;

import com.cinema.kino.dto.GoogleDTO;
import com.cinema.kino.dto.GoogleLoginResponseDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.SocialAccount;
import com.cinema.kino.repository.SocialAccountRepository;
import com.cinema.kino.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final SocialAccountRepository socialAccountRepository;
    private final JwtUtil jwtUtil;

    @Value("${google.client-id}") private String clientId;
    @Value("${google.client-secret}") private String clientSecret;
    @Value("${google.redirect-uri}") private String redirectUri;

    public GoogleLoginResponseDTO login(String code) {
        String accessToken = getGoogleAccessToken(code);
        GoogleDTO.GoogleUserInfoResponse googleUser = getGoogleUserInfo(accessToken);

        String providerId = googleUser.getId();
        log.info("🔍 구글에서 받은 providerId: [{}]", providerId);

        Optional<SocialAccount> socialAccountOpt = socialAccountRepository.findByProviderAndProviderId("GOOGLE", providerId);

        if (socialAccountOpt.isPresent()) {
            Member member = socialAccountOpt.get().getMember();
            String token = jwtUtil.createToken(member.getId(), member.getUsername(), member.getName());

            return GoogleLoginResponseDTO.builder()
                    .isRegistered(true)
                    .token(token)
                    .username(member.getUsername())
                    .name(member.getName())
                    .memberId(member.getId())
                    .build();
        } else {
            String randomUsername = "user_" + UUID.randomUUID().toString().substring(0, 8);

            return GoogleLoginResponseDTO.builder()
                    .isRegistered(false)
                    .provider("GOOGLE")
                    .username(randomUsername)
                    .providerId(providerId)
                    .profileImage(googleUser.getPicture())
                    .email(googleUser.getEmail())
                    .build();
        }
    }

    public String getGoogleAccessToken(String code) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);
        // 🚨 구글은 토큰 발급 시에도 redirect_uri가 필수입니다!
        params.add("redirect_uri", redirectUri);

        ResponseEntity<GoogleDTO.GoogleTokenResponse> response = rt.exchange(
                "https://oauth2.googleapis.com/token",
                HttpMethod.POST,
                new HttpEntity<>(params, headers),
                GoogleDTO.GoogleTokenResponse.class
        );
        return response.getBody().getAccess_token();
    }

    private GoogleDTO.GoogleUserInfoResponse getGoogleUserInfo(String accessToken) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);

        ResponseEntity<GoogleDTO.GoogleUserInfoResponse> response = rt.exchange(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                GoogleDTO.GoogleUserInfoResponse.class
        );
        return response.getBody();
    }
}