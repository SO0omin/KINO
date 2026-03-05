package com.cinema.kino.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.http.SessionCreationPolicy;
import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final com.cinema.kino.config.JwtFilter jwtFilter;

    public SecurityConfig(com.cinema.kino.config.JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                //JWT를 쓸 때는 세션(Session)을 안 쓴다고 확실히 못 박아야 합니다.
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .headers(headers -> headers
                        .contentTypeOptions(withDefaults())
                        .cacheControl(withDefaults())
                        .frameOptions(frame -> frame.sameOrigin())
                )

                // 문단속 시작!
                .authorizeHttpRequests(auth -> auth
                        // 🟢 1. 누구나 구경할 수 있는 API (팔찌 검사 안 함 - Free Pass)
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**",          //스웨거 사용하기 위한 부분
                                "/api/main/**",
                                "/api/auth/**",         // 로그인, 회원가입, 아이디/비번 찾기
                                "/api/movies/**",       // 메인 페이지 영화 목록, 영화 상세 정보
                                "/api/screenings/**",   // 상영 시간표, 좌석 조회 (티켓팅 페이지)
                                "/api/reviews/**",      // 리뷰 조회 (보통 조회는 누구나 가능하게 둠)
                                "/api/ticketing/**",
                                "/api/timetable/**",
                                "/api/theaters/**",
                                "/ws-kino/**",
                                "/ws-seat/**",
                                "/error"
                        ).permitAll()
                        .requestMatchers(
                                "/api/mypage/**",       // 마이페이지 (내 정보, 쿠폰, 포인트 등)
                                "/api/reservations/**", // 예매하기 (좌석 홀딩 및 결제)
                                "/api/payments/**",     // 결제 처리
                                "/api/likes/**"         // 영화 좋아요 누르기
                        ).authenticated()

                        // 🟡 3. 그 외에 혹시 빼먹은 API가 있다면? (기본적으로 막아두는 것이 안전합니다)
                        .anyRequest().authenticated()
                ).addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }

    // 프론트엔드(5173 포트)의 접근을 허용하는 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // 리액트 주소
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // 가장 강력하고 표준적인 해시 암호화
    }


}
