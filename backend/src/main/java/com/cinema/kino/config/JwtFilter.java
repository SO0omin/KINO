package com.cinema.kino.config;

import com.cinema.kino.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 1. 프론트엔드가 보낸 요청 헤더에서 팔찌(토큰)를 꺼냅니다.
        String token = resolveToken(request);

        // 2. 팔찌가 있고, 유통기한이 지나지 않은 '진짜'인지 검사합니다.
        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {

            // 3. 진짜 팔찌라면, 팔찌에 적힌 이름(username)을 읽어옵니다.
            String username = jwtUtil.getUsername(token);

            // 4. 스프링 보안요원이 알아먹을 수 있는 형태(Authentication)로 포장합니다.
            UserDetails userDetails = User.builder()
                    .username(username)
                    .password("") // 비밀번호는 이미 로그인할 때 검사했으니 빈 칸으로 둡니다.
                    .authorities(Collections.emptyList()) // 권한 설정 (현재는 일반 유저로 통일)
                    .build();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            // 5. "이 손님은 검사 통과했어!" 하고 스프링 시큐리티 상황판(Context)에 등록합니다.
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("✅ 토큰 검사 통과! 접속한 유저: {}", username);
        }

        // 6. 다음 목적지(Controller)나 다음 필터로 손님을 들여보냅니다. (이 줄이 없으면 멈춰버림!)
        filterChain.doFilter(request, response);
    }

    // 헤더에서 "Bearer " 글자를 떼어내고 순수 토큰만 쏙 빼오는 도우미 메서드
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}