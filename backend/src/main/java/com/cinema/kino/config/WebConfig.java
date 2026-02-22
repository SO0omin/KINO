package com.cinema.kino.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:5173",   // 로컬 테스트용
                    "http://13.209.65.96",     // 실제 서버 프론트엔드 주소
                    "http://13.209.65.96:5173" // 포트 붙였을 때 대비
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*"); // 모든 헤더 허용
    }
}