package com.cinema.kino.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //1. 티켓팅 모달의 엔드포인트
        registry.addEndpoint("/ws-kino")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        //2. 좌석지정 페이지의 엔드포인트
        registry.addEndpoint("/ws-seat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic"); // 구독(서버->클라이언트)
        registry.setApplicationDestinationPrefixes("/app"); // 전송(클라이언트->서버)
    }

}