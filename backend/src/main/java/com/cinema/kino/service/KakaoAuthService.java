package com.cinema.kino.service;

import com.cinema.kino.dto.KakaoDTO;
import com.cinema.kino.dto.KakaoLoginResponseDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.SocialAccount; // 💡 추가
import com.cinema.kino.repository.SocialAccountRepository; // 💡 추가
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
public class KakaoAuthService {

    // 💡 MemberRepository 대신 SocialAccountRepository 주입
    private final SocialAccountRepository socialAccountRepository;
    private final JwtUtil jwtUtil;

    @Value("${kakao.rest-api-key}") private String clientId;
    @Value("${kakao.redirect-uri}") private String redirectUri;
    @Value("${kakao.client-secret}") private String clientSecret;

    public KakaoLoginResponseDTO login(String code) {
        String accessToken = getKakaoAccessToken(code);
        KakaoDTO.KakaoUserInfoResponse userInfo = getKakaoUserInfo(accessToken);
        String providerId = userInfo.getId().toString();

        // 💡 여기에 로그를 추가해 보세요!
        log.info("🔍 카카오에서 받은 providerId: [{}]", providerId);

        // 1. SocialAccount 테이블에서 해당 카카오 정보가 있는지 조회 💡
        Optional<SocialAccount> socialAccountOpt = socialAccountRepository.findByProviderAndProviderId("KAKAO", providerId);
        log.info("🔍 DB 조회 결과: 가입된 계정인가요? = {}", socialAccountOpt.isPresent());

        if (socialAccountOpt.isPresent()) {
            // 이미 가입된 회원 -> SocialAccount에서 본체(Member)를 꺼내서 토큰 발급
            Member member = socialAccountOpt.get().getMember();
            String token = jwtUtil.createToken(member.getId(), member.getUsername(), member.getName());

            return KakaoLoginResponseDTO.builder()
                    .isRegistered(true)
                    .token(token)
                    .username(member.getUsername())
                    .name(member.getName())
                    .memberId(member.getId())
                    .build();
        } else {
            // 회원 X -> 회원가입 창으로 뿌려주기
            String randomUsername = "user_" + UUID.randomUUID().toString().substring(0, 8);

            String name = (userInfo.getKakaoAccount() != null && userInfo.getKakaoAccount().getProfile() != null)
                    ? userInfo.getKakaoAccount().getProfile().getNickname() : "";

            String profileImage = (userInfo.getKakaoAccount() != null && userInfo.getKakaoAccount().getProfile() != null)
                    ? userInfo.getKakaoAccount().getProfile().getProfileImageUrl() : null;

            return KakaoLoginResponseDTO.builder()
                    .isRegistered(false)
                    .provider("KAKAO") // 💡 프론트엔드가 어떤 소셜인지 알 수 있게 추가
                    .username(randomUsername)
                    .name(name)
                    .providerId(providerId)
                    .profileImage(profileImage)
                    .build();
        }
    }

    public String getKakaoAccessToken(String code) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        if (clientSecret != null && !clientSecret.isBlank()) {
            params.add("client_secret", clientSecret);
        }

        ResponseEntity<KakaoDTO.KakaoTokenResponse> response = rt.exchange(
                "https://kauth.kakao.com/oauth/token",
                HttpMethod.POST,
                new HttpEntity<>(params, headers),
                KakaoDTO.KakaoTokenResponse.class
        );
        return response.getBody().getAccessToken();
    }

    private KakaoDTO.KakaoUserInfoResponse getKakaoUserInfo(String accessToken) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        ResponseEntity<KakaoDTO.KakaoUserInfoResponse> response = rt.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.POST,
                new HttpEntity<>(headers),
                KakaoDTO.KakaoUserInfoResponse.class
        );
        return response.getBody();
    }
}