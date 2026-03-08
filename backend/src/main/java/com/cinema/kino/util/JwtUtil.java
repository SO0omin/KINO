package com.cinema.kino.util;

import io.jsonwebtoken.Claims;
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

    public JwtUtil(@Value("${jwt.secret}") String secretKeyString) {
        this.key = Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    //회원(Member)용 토큰 발급
    public String createToken(Long memberId, String username, String name) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + 1000 * 60 * 60L); // 1시간

        return Jwts.builder()
                .setSubject(username)
                .claim("memberId", memberId)
                .claim("name", name)
                .claim("isGuest", false)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    //비회원(Guest)용 토큰 발급 메서드 추가!
    public String createGuestToken(Long guestId, String name) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + 1000 * 60 * 60L); // 1시간

        return Jwts.builder()
                .setSubject("GUEST_" + guestId) // 비회원은 아이디가 없으니 임의 식별자 부여
                .claim("guestId", guestId)      // 비회원 PK
                .claim("name", name)            // 비회원 이름
                .claim("isGuest", true)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    public Long getMemberId(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Number memberId = claims.get("memberId", Number.class);

        if (memberId == null) {
            throw new IllegalArgumentException("토큰에 memberId 정보가 없습니다.");
        }

        return memberId.longValue();
    }
}