package com.cinema.kino.config;

import com.cinema.kino.util.JwtUtil;
import io.jsonwebtoken.Claims;
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
        String token = resolveToken(request);

        if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
            Claims claims = jwtUtil.getClaims(token);
            Boolean isGuest = claims.get("isGuest", Boolean.class);

            if (Boolean.TRUE.equals(isGuest)) {
                // ================= [ 비회원 로직 ] =================
                // 💡 비회원은 토큰의 Subject("GUEST_123" 등)를 username으로 씁니다!
                String guestUsername = claims.getSubject();

                // 주인공(Principal) 자리에 guestUsername(String)을 넣습니다.
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(guestUsername, null, Collections.emptyList());

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("✅ 토큰 검사 통과! 접속한 비회원 username: {}", guestUsername);

            } else {
                // ================= [ 회원 로직 ] =================
                String username = claims.getSubject();
                // 💡 회원은 컨트롤러에서 바로 쓸 수 있게 memberId(Long)를 뽑아옵니다.
                Long memberId = claims.get("memberId", Number.class).longValue();

                UserDetails userDetails = User.builder()
                        .username(username)
                        .password("")
                        .authorities(Collections.emptyList())
                        .build();

                // 주인공(Principal) 자리에 memberId(Long)를 넣습니다.
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(memberId, null, userDetails.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("✅ 토큰 검사 통과! 접속한 회원 ID: {} (username: {})", memberId, username);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}