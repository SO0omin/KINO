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


/*
@Service
@RequiredArgsConstructor
public class SmsService {

    @Value("${sms.mock-enabled:true}")
    private boolean mockEnabled;

    @Value("${sms.ncp.access-key:}")
    private String accessKey;

    @Value("${sms.ncp.secret-key:}")
    private String secretKey;

    @Value("${sms.ncp.service-id:}")
    private String serviceId;

    @Value("${sms.ncp.sender-phone:}")
    private String senderPhone;

    private static final String NCP_HOST = "https://sens.apigw.ntruss.com";

    public void sendPointPasswordCode(String phone, String code) {
        String content = "[KINO] 포인트 비밀번호 인증번호는 [" + code + "] 입니다.";
        sendSms(phone, content);
    }

    private void sendSms(String toPhone, String content) {
        if (mockEnabled) {
            return;
        }

        if (isBlank(accessKey) || isBlank(secretKey) || isBlank(serviceId) || isBlank(senderPhone)) {
            throw new IllegalArgumentException("SMS 설정값이 없습니다. SMS_NCP_ACCESS_KEY/SECRET_KEY/SERVICE_ID/SENDER_PHONE를 확인해 주세요.");
        }

        String uri = "/sms/v2/services/" + serviceId + "/messages";
        String url = NCP_HOST + uri;
        String timestamp = String.valueOf(System.currentTimeMillis());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-ncp-apigw-timestamp", timestamp);
        headers.set("x-ncp-iam-access-key", accessKey);
        headers.set("x-ncp-apigw-signature-v2", createSignature(timestamp, uri));

        Map<String, Object> body = Map.of(
                "type", "SMS",
                "contentType", "COMM",
                "countryCode", "82",
                "from", senderPhone,
                "content", content,
                "messages", List.of(Map.of("to", toPhone, "content", content))
        );

        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> resp = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), String.class);
            if (!resp.getStatusCode().is2xxSuccessful()) {
                throw new IllegalArgumentException("문자 발송에 실패했습니다.");
            }
        } catch (HttpStatusCodeException e) {
            String error = e.getResponseBodyAsString();
            throw new IllegalArgumentException((error == null || error.isBlank())
                    ? "문자 발송에 실패했습니다."
                    : "문자 발송에 실패했습니다: " + error);
        } catch (RestClientException e) {
            throw new IllegalArgumentException("문자 발송 중 통신 오류가 발생했습니다.");
        }
    }

    private String createSignature(String timestamp, String uri) {
        try {
            String message = "POST " + uri + "\n" + timestamp + "\n" + accessKey;
            SecretKeySpec signingKey = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(signingKey);
            byte[] rawHmac = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new IllegalArgumentException("SMS 서명 생성에 실패했습니다.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
*/