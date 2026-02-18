/* ========================
좌석 상태를 변경하는 서비스, 명령(Command) 담당
CQRS 스타일로, SeatService(Query)와 분리
CQRS(Command Query Responsibility Segregation):
시스템의 데이터 변경(Command, 명령)과 데이터 조회(Query, 쿼리) 작업을 별도의 모델과 프로세스로 분리하여 관리 설계 패턴
======================== */
package com.cinema.kino.service;

import com.cinema.kino.dto.SeatSelectRequestDTO;
import com.cinema.kino.dto.SeatStatusResponseDTO;
import com.cinema.kino.entity.ScreeningSeat;
import com.cinema.kino.entity.enums.SeatStatus;
import com.cinema.kino.repository.ScreeningSeatRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class SeatCommandService {

    private final ScreeningSeatRepository screeningSeatRepository;

    @Transactional
    public List<SeatStatusResponseDTO> holdSeats(SeatSelectRequestDTO request) {

        List<ScreeningSeat> seats = screeningSeatRepository.findAllByScreeningIdAndSeatIdsWithLock(
                request.getScreeningId(),
                request.getSeatIds()
        ); //비관적 락

        if (seats.size() != request.getSeatIds().size()) {
            throw new IllegalArgumentException("요청한 좌석 중 일부를 찾을 수 없습니다.");
        } //프론트 요청 좌석 개수와 DB 좌석 개수를 비교

        List<SeatStatusResponseDTO> responses = new ArrayList<>();

        for (ScreeningSeat ss : seats) {
            ss.hold(request.getMemberId(), request.getGuestId()); //도메인 메서드

            // 영속성 컨텍스트(JPA 메모리)에 있는 엔티티를 바로 DTO로 변환: 이러면 lazy loading 에러 발생하지않음
            responses.add(SeatStatusResponseDTO.from(ss));
        }


        return responses; //트랜잭션이 끝나면서 JPA가 변경 감지를 통해 UPDATE 쿼리들을 날림
    }
}