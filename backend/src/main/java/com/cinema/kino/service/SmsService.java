package com.cinema.kino.service;

import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class SmsService {

    @Value("${solapi.api-key}")
    private String apiKey;

    @Value("${solapi.api-secret}")
    private String apiSecret;

    @Value("${solapi.from-number}")
    private String fromNumber;

    private DefaultMessageService messageService;

    @PostConstruct
    private void init() {
        // SDK 초기화: API Key와 Secret을 사용하여 서비스 객체 생성
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.solapi.com");
    }

    /**
     * 포인트 비밀번호 인증번호 SMS 발송
     */
    public void sendPointPasswordCode(String toNumber, String authCode) {
        Message message = new Message();
        message.setFrom(fromNumber);
        message.setTo(toNumber);
        message.setText("[Kino Cinema] 인증번호 [" + authCode + "]를 입력해주세요.");

        try {
            SingleMessageSentResponse response = this.messageService.sendOne(new SingleMessageSendingRequest(message));
            System.out.println("SMS 발송 성공: " + response.getMessageId());
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("SMS 발송 실패: " + e.getMessage());
            throw new RuntimeException("SMS 전송 중 오류가 발생했습니다.");
        }
    }
}
