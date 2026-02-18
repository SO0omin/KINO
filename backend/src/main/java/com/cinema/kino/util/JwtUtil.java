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

    private final long EXPIRE_TIME = 1000 * 60 * 60 * 24L; // 토큰 유효시간: 24시간

    public JwtUtil(@Value("${jwt.secret}") String secretKeyString) {
        this.key = Keys.hmacShaKeyFor(secretKeyString.getBytes());
    }

    // 팔찌(토큰) 발급 메서드
    public String createToken(String username) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + EXPIRE_TIME);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}