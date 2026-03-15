package com.cinema.kino.service;

import com.cinema.kino.entity.Member;
import com.cinema.kino.entity.Reservation;
import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.repository.ScreeningSeatRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender javaMailSender;
    private final ScreeningSeatRepository screeningSeatRepository;

    @Async
    public void sendPaymentCompleteEmail(Member member, Reservation reservation, String bookingNo) {
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(member.getEmail());
            helper.setSubject("[Kino Cinema] 예매가 성공적으로 완료되었습니다!");
            List<ScreeningSeat> seats = screeningSeatRepository.findByReservationId(reservation.getId());
            List<String> seatNames = seats.stream()
                    .map(s -> s.getSeat().getSeatRow() + s.getSeat().getSeatNumber())
                    .collect(Collectors.toList());

            // HTML 내용 (디자인 포함)
            String htmlContent = String.format(
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;'>" +
                            "  <div style='background: #eb4d32; padding: 24px; text-align: center; color: white;'>" +
                            "    <h1 style='margin: 0; font-size: 24px;'>KINO CINEMA</h1>" +
                            "  </div>" +
                            "  <div style='padding: 32px; color: #111827;'>" +
                            "    <h2 style='margin-top: 0;'>결제가 완료되었습니다!</h2>" +
                            "    <p>안녕하세요, <b>%s</b>님. KINO를 이용해 주셔서 감사합니다.</p>" +
                            "    <p>선택하신 영화의 예매가 정상적으로 처리되었습니다. 즐거운 관람 되시길 바랍니다!</p>" +
                            "    <hr style='border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;' />" +
                            "    <div style='background: #f9fafb; padding: 20px; border-radius: 8px;'>" +
                            "      <p style='margin: 0 0 10px 0;'><b>🎫 예매번호:</b> <span style='color: #eb4d32; font-weight: bold;'>%s</span></p>" +
                            "      <p style='margin: 0 0 10px 0;'><b>🎬 영화:</b> %s</p>" +
                            "      <p style='margin: 0 0 10px 0;'><b>📍 극장:</b> %s / %s</p>" +
                            "      <p style='margin: 0 0 10px 0;'><b>⏰ 일시:</b> %s</p>" +
                            "      <p style='margin: 0;'><b>💺 좌석:</b> %s</p>" +
                            "    </div>" +
                            "    <div style='margin-top: 32px; text-align: center;'>" +
                            "      <a href='https://your-kino-domain.com/mypage' style='background: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>나의 예매내역 확인하기</a>" +
                            "    </div>" +
                            "  </div>" +
                            "  <div style='background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;'>" +
                            "    본 메일은 발신 전용입니다. 문의사항은 고객센터를 이용해 주세요." +
                            "  </div>" +
                            "</div>",
                    member.getName(),
                    bookingNo,
                    reservation.getScreening().getMovie().getTitle(),
                    reservation.getScreening().getScreen().getTheater().getName(),
                    reservation.getScreening().getScreen().getName(),
                    reservation.getScreening().getStartTime(),
                    String.join(", ", seatNames)
            );

            helper.setText(htmlContent, true); // true를 넣어야 HTML로 렌더링됩니다.
            javaMailSender.send(message);
        } catch (MessagingException e) {
            log.error("이메일 발송 실패", e);
        }
    }

    /**
     * 비밀번호 재설정 HTML 이메일 발송
     */
    public void sendPasswordResetEmail(Member member, String token) {
        MimeMessage message = javaMailSender.createMimeMessage();

        // 프론트엔드 비밀번호 재설정 페이지 주소
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(member.getEmail());
            helper.setSubject("[Kino Cinema] 비밀번호 재설정 안내드립니다.");

            // HTML 내용 (예매 완료 메일과 통일된 디자인)
            String htmlContent = String.format(
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;'>" +
                            "  <div style='background: #eb4d32; padding: 24px; text-align: center; color: white;'>" +
                            "    <h1 style='margin: 0; font-size: 24px;'>KINO CINEMA</h1>" +
                            "  </div>" +
                            "  <div style='padding: 32px; color: #111827;'>" +
                            "    <h2 style='margin-top: 0;'>비밀번호를 재설정하시겠습니까?</h2>" +
                            "    <p>안녕하세요, <b>%s</b>님. KINO Cinema입니다.</p>" +
                            "    <p>고객님의 계정에 대한 비밀번호 재설정 요청이 접수되었습니다.</p>" +
                            "    <p>본인이 요청하신 것이 맞다면, 아래 <b>'비밀번호 재설정하기'</b> 버튼을 클릭하여 새로운 비밀번호를 설정해 주세요.</p>" +
                            "    " +
                            "    <div style='margin-top: 32px; text-align: center;'>" +
                            "      <a href='%s' style='background: #eb4d32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; shadow: 0 4px 6px rgba(0,0,0,0.1);'>비밀번호 재설정하기</a>" +
                            "    </div>" +
                            "    " +
                            "    <div style='margin-top: 32px; background: #fff7f5; padding: 20px; border-radius: 8px; border-left: 4px solid #eb4d32;'>" +
                            "      <p style='margin: 0; font-size: 13px; color: #9a3412;'>" +
                            "        ⚠️ <b>주의사항</b><br/>" +
                            "        • 이 링크는 보안을 위해 <b>30분 동안만 유효</b>합니다.<br/>" +
                            "        • 본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다. 계정은 안전하게 유지됩니다." +
                            "      </p>" +
                            "    </div>" +
                            "  </div>" +
                            "  <div style='background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;'>" +
                            "    KINO Cinema - 즐거운 영화 그 이상의 감동<br/>" +
                            "    본 메일은 발신 전용입니다." +
                            "  </div>" +
                            "</div>",
                    member.getName(),
                    resetUrl
            );

            helper.setText(htmlContent, true); // true로 설정하여 HTML 렌더링 활성화
            javaMailSender.send(message);

            log.info("[Email] 비밀번호 재설정 메일 발송 완료: {}", member.getEmail());

        } catch (MessagingException e) {
            log.error("[Email] 비밀번호 재설정 메일 발송 중 오류 발생: {}", member.getEmail(), e);
            throw new RuntimeException("이메일 발송에 실패했습니다.");
        }
    }
}
