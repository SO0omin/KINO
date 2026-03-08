package com.cinema.kino.service;

import com.cinema.kino.dto.GoogleDTO;
import com.cinema.kino.dto.KakaoDTO;
import com.cinema.kino.dto.NaverDTO;
import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.SocialAccount;
import com.cinema.kino.repository.MemberRepository;
import com.cinema.kino.repository.SocialAccountRepository;
import com.cinema.kino.util.JwtUtil; // 🌟 추가됨
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class SocialLinkService {

    private final MemberRepository memberRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final GoogleAuthService googleAuthService;
    private final KakaoAuthService kakaoAuthService;
    private final NaverAuthService naverAuthService;
    private final JwtUtil jwtUtil; // 🌟 JwtUtil 주입!

    /**
     * [마이페이지] 소셜 연동하기
     */
    @Transactional
    public void linkSocialAccount(String authHeader, String provider, String code, String state) {
        try {
            // 1. 내 ID 꺼내기
            String token = authHeader.replace("Bearer ", "");
            Long currentMemberId = jwtUtil.getMemberId(token);

            // 2. 코드(code)를 진짜 출입증(accessToken)으로 교환하기!
            String realAccessToken = "";

            // 💡 회원님이 원래 만들어두신 Auth 서비스들을 주입(@RequiredArgsConstructor)받아서 써야 합니다!
            if ("GOOGLE".equals(provider)) {
                realAccessToken = googleAuthService.getGoogleAccessToken(code);
            } else if ("KAKAO".equals(provider)) {
            realAccessToken = kakaoAuthService.getKakaoAccessToken(code);
            }  else if (provider.equals("NAVER")) {
                realAccessToken = naverAuthService.getNaverAccessToken(code,state);
            }
            // 2. 외부(카카오/구글/네이버) API를 찔러서 소셜 고유 ID를 가져옵니다.
            String providerId = extractProviderId(provider.toUpperCase(), realAccessToken);
            log.info("🔗 [소셜 연동 요청] MemberId: {}, Provider: {}, ProviderId: {}", currentMemberId, provider, providerId);

            if (socialAccountRepository.existsByMemberIdAndProvider(currentMemberId, provider)) {
                return; // 이미 연동되어 있다면 조용히 리턴 (멱등성 확보)
            }

            // 3. 다른 사람이 이미 이 소셜 계정을 쓰고 있는지 체크 (중복 가입 방지)
            if (socialAccountRepository.existsByProviderAndProviderId(provider, providerId)) {
                throw new IllegalArgumentException("이미 다른 계정에 연동된 소셜 정보입니다.");
            }

            // 4. 내(Member) 엔티티 정보 가져오기
            Member member = memberRepository.findById(currentMemberId)
                    .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));

            // 5. 연동 정보 저장 (INSERT)
            SocialAccount socialAccount = SocialAccount.builder()
                    .member(member)
                    .provider(provider.toUpperCase())
                    .providerId(providerId)
                    .build();

            socialAccountRepository.save(socialAccount);
        } catch (Exception e) {
            log.error("💥💥💥 [대참사] 연동 중 백엔드 에러 발생!!! 💥💥💥", e);
            throw new RuntimeException("소셜 연동 실패: " + e.getMessage());
        }
    }

    /**
     * [마이페이지] 소셜 연동 해제하기
     */
    @Transactional
    public void unlinkSocialAccount(String authHeader, String provider) {

        // 🌟 KINO JWT 토큰에서 내 회원 ID 꺼내기
        String token = authHeader.replace("Bearer ", "");
        Long currentMemberId = jwtUtil.getMemberId(token); // 💡 여기도 메서드명 확인!

        // 내 멤버 ID와 provider 정보를 기준으로 연동 데이터 삭제 (DELETE)
        socialAccountRepository.deleteByMemberIdAndProvider(currentMemberId, provider.toUpperCase());
        log.info("✂️ [소셜 연동 해제] MemberId: {}, Provider: {}", currentMemberId, provider);
    }

    /* =========================================================
       내부 도우미(Helper) 로직: 각 플랫폼별 토큰 해독기 (유지)
       ========================================================= */
    private String extractProviderId(String provider, String accessToken) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        switch (provider) {
            case "GOOGLE":
                ResponseEntity<GoogleDTO.GoogleUserInfoResponse> googleRes = rt.exchange(
                        "https://www.googleapis.com/oauth2/v2/userinfo",
                        HttpMethod.GET,
                        entity,
                        GoogleDTO.GoogleUserInfoResponse.class
                );
                return googleRes.getBody().getId();

            case "KAKAO":
                headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
                ResponseEntity<KakaoDTO.KakaoUserInfoResponse> kakaoRes = rt.exchange(
                        "https://kapi.kakao.com/v2/user/me",
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        KakaoDTO.KakaoUserInfoResponse.class
                );
                return String.valueOf(kakaoRes.getBody().getId());

            case "NAVER":
                ResponseEntity<NaverDTO.NaverUserInfoResponse> naverRes = rt.exchange(
                        "https://openapi.naver.com/v1/nid/me",
                        HttpMethod.GET,
                        entity,
                        NaverDTO.NaverUserInfoResponse.class
                );
                return naverRes.getBody().getResponse().getId();

            default:
                throw new IllegalArgumentException("지원하지 않는 소셜 플랫폼입니다: " + provider);
        }
    }
}