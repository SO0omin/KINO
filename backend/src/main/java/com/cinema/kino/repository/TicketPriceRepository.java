package com.cinema.kino.repository;

import com.cinema.kino.entity.TicketPrice;
import com.cinema.kino.entity.enums.PriceType;
import com.cinema.kino.entity.enums.ScreenType;
import com.cinema.kino.entity.enums.ScreeningType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 티켓 가격(TicketPrice) 엔티티 데이터 접근 Repository
 *
 * 역할:
 * - 상영관 타입(ScreenType)
 * - 요금 타입(PriceType: 일반/청소년 등)
 * - 상영 타입(ScreeningType: 2D/3D/특별관 등)
 *
 * 위 세 가지 조합에 따른 "정확한 티켓 가격"을 조회합니다.
 *
 * 설계 의도:
 * - 가격을 코드에 하드코딩하지 않고 DB 기반 정책으로 관리
 * - 요금 정책 변경 시 코드 수정 없이 데이터 변경으로 대응 가능
 */
public interface TicketPriceRepository extends JpaRepository<TicketPrice, Long> {

    /**
     * 상영관 타입 + 요금 타입 + 상영 타입 조합에 해당하는 티켓 가격 조회
     *
     * 사용 시점 예:
     * - 결제 준비 단계(prepare)에서 좌석별 금액 계산 시
     * - 서버에서 최종 금액 재계산(프론트 신뢰 금지)
     *
     * @param screenType 상영관 타입 (예: STANDARD, IMAX 등)
     * @param priceType 요금 타입 (예: ADULT, TEEN 등)
     * @param screeningType 상영 방식 (예: 2D, 3D 등)
     *
     * @return 조건에 맞는 티켓 가격(Optional)
     *         존재하지 않으면 Optional.empty()
     *
     * 주의:
     * - 해당 조합이 반드시 DB에 존재하도록 초기 데이터 세팅 필요
     * - 없을 경우 금액 계산 로직에서 예외 처리 필요
     */
    Optional<TicketPrice> findByScreenTypeAndPriceTypeAndScreeningType(
            ScreenType screenType,
            PriceType priceType,
            ScreeningType screeningType
    );
}
