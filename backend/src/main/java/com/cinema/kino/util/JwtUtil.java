package com.cinema.kino.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;

    private final long EXPIRE_TIME = 1000 * 60 * 60; // 토큰 유효시간: 1시간

    public JwtUtil(@Value("${jwt.secret}") String secretKeyString) {
        this.key = Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    // 팔찌(토큰) 발급 메서드
    public String createToken(Long memberId, String username, String name) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + 1000 * 60 * 60L); // 1시간

        return Jwts.builder()
                .setSubject(username) // 기본 아이디
                .claim("memberId", memberId) // 💡 페이로드에 회원번호 추가!
                .claim("name", name)         // 💡 페이로드에 진짜 이름 추가!
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}