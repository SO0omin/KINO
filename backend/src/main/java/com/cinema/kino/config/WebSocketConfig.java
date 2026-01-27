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
        //1. 이류진이 쓰는 엔드포인트
        registry.addEndpoint("/ws-kino")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        //2. 정수민이 쓰는 엔드포인트
        registry.addEndpoint("/ws-seat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic"); // 구독
        registry.setApplicationDestinationPrefixes("/app"); // 전송
    }

}