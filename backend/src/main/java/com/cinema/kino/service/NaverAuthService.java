package com.cinema.kino.service;

import com.cinema.kino.dto.NaverLoginResponseDTO;
import com.cinema.kino.dto.NaverDTO;
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
public class NaverAuthService {

    private final SocialAccountRepository socialAccountRepository;
    private final JwtUtil jwtUtil;

    // 💡 application.yml에 naver.client-id 와 naver.client-secret 추가 필요!
    @Value("${naver.client-id}") private String clientId;
    @Value("${naver.client-secret}") private String clientSecret;

    public NaverLoginResponseDTO login(String code, String state) {
        log.info("==== 네이버 로그인 로직 시작 ====");
        log.info("1. 프론트에서 받은 code: {}", code);
        log.info("1. 프론트에서 받은 state: {}", state);

        // 1. 네이버 토큰 및 유저 정보 획득
        String accessToken = getNaverAccessToken(code, state);
        NaverDTO.NaverUserInfoResponse userInfo = getNaverUserInfo(accessToken);
        NaverDTO.NaverUserInfoResponse.Response naverUser = userInfo.getResponse();

        String providerId = naverUser.getId();

        if (accessToken == null || accessToken.isBlank()) {
            throw new RuntimeException("네이버 Access Token을 발급받지 못했습니다.");
        }
        // 2. 우리 DB 조회
        Optional<SocialAccount> socialAccountOpt = socialAccountRepository.findByProviderAndProviderId("NAVER", providerId);

        if (socialAccountOpt.isPresent()) {
            // 🟢 가입된 회원: 로그인 처리
            Member member = socialAccountOpt.get().getMember();
            String token = jwtUtil.createToken(member.getId(), member.getUsername(), member.getName());

            return NaverLoginResponseDTO.builder()
                    .isRegistered(true)
                    .token(token)
                    .username(member.getUsername())
                    .name(member.getName())
                    .memberId(member.getId())
                    .build();
        } else {
            // 🔴 미가입 회원: 프론트로 데이터 뿌리기
            String randomUsername = "user_" + UUID.randomUUID().toString().substring(0, 8);

            // 💡 생년월일 조합 (YYYY-MM-DD 형식으로 맞춤)
            String birthDate = "";
            if (naverUser.getBirthyear() != null && naverUser.getBirthday() != null) {
                birthDate = naverUser.getBirthyear() + "-" + naverUser.getBirthday();
            }

            return NaverLoginResponseDTO.builder()
                    .isRegistered(false)
                    .provider("NAVER")
                    .name(naverUser.getName())
                    .username(randomUsername)
                    .providerId(providerId)
                    .profileImage(naverUser.getProfileImage())
                    .tel(naverUser.getMobile())
                    .birthDate(birthDate)
                    .build();
        }
    }

    public String getNaverAccessToken(String code, String state) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);
        params.add("state", state);

        // 💡 디버깅을 위해 응답 전체를 까볼 수 있도록 수정
        ResponseEntity<NaverDTO.NaverTokenResponse> response = rt.exchange(
                "https://nid.naver.com/oauth2.0/token",
                HttpMethod.POST,
                new HttpEntity<>(params, headers),
                NaverDTO.NaverTokenResponse.class
        );

        NaverDTO.NaverTokenResponse tokenResponse = response.getBody();

        // 🚨 네이버가 토큰 대신 에러를 줬을 때 잡아내는 함정!
        if (tokenResponse != null && tokenResponse.getError() != null) {
            log.error("❌ 네이버 토큰 발급 에러! error: {}, description: {}",
                    tokenResponse.getError(), tokenResponse.getErrorDescription());
            throw new RuntimeException("네이버 토큰 발급 실패: " + tokenResponse.getErrorDescription());
        }

        // 정상적으로 토큰을 받았다면 로그로 출력
        String accessToken = tokenResponse != null ? tokenResponse.getAccessToken() : null;
        log.info("✅ 획득한 네이버 Access Token: [{}]", accessToken);

        return accessToken;
    }

    private NaverDTO.NaverUserInfoResponse getNaverUserInfo(String accessToken) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        ResponseEntity<NaverDTO.NaverUserInfoResponse> response = rt.exchange(
                "https://openapi.naver.com/v1/nid/me",
                HttpMethod.GET, // 💡 네이버 유저 정보 조회는 GET 요청입니다.
                new HttpEntity<>(headers),
                NaverDTO.NaverUserInfoResponse.class
        );
        return response.getBody();
    }
}