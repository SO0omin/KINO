package com.cinema.kino.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("🎬 Kino Cinema API 명세서")
                        .description("키노 영화관의 좌석 예매 및 조회 API 테스트 문서입니다.")
                        .version("v1.0.0"));
    }
}