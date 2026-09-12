package com.cinema.kino.repository;

import com.cinema.kino.entity.Payment;
import com.cinema.kino.entity.Reservation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 결제(Payment) 엔티티 데이터 접근 Repository
 *
 * 주요 관심사:
 * - 예약(Reservation)과 결제(Payment)의 연관관계를 기반으로 조회
 * - 주문번호(merchantUid/orderId) 기반 조회
 * - 결제 승인(Confirm) 단계에서 동시성/중복 처리 방지를 위한 락 조회 제공
 *
 * 주의:
 * 결제는 "중복 승인"이 발생하면 실제 금전 문제로 이어질 수 있으므로,
 * 승인 처리 로직에서는 락 조회(findByMerchantUidForUpdate) 사용을 고려합니다.
 */
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * 예약(Reservation)과 연결된 결제(Payment)를 조회합니다.
     *
     * 의도:
     * - 단순히 reservationId(Long)로 조회하는 방식보다,
     *   엔티티 연관관계를 기반으로 조회하는 것이 JPA 설계/가독성 측면에서 명확합니다.
     *
     * @param reservation 결제를 조회할 예약 엔티티
     * @return 해당 예약에 연결된 결제(Optional)
     */
    Optional<Payment> findByReservation(Reservation reservation);
    Optional<Payment> findByReservationId(Long reservationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.reservation.id = :reservationId")
    Optional<Payment> findByReservationIdForUpdate(@Param("reservationId") Long reservationId);

    /**
     * 주문번호(merchantUid)로 결제를 조회합니다.
     *
     * 사용 시점 예:
     * - 결제 승인 요청(confirm) 시, 프론트에서 전달한 orderId(=merchantUid)로 결제 레코드를 찾음
     * - 결제 상태 조회/재시도 처리
     *
     * @param merchantUid 주문번호(merchantUid / orderId)
     * @return 주문번호에 해당하는 결제(Optional)
     */
    Optional<Payment> findByMerchantUid(String merchantUid);

    /**
     * 주문번호(merchantUid)로 결제를 조회하되, 쓰기 락(PESSIMISTIC_WRITE)을 걸어 조회합니다.
     *
     * 목적:
     * - 결제 승인(confirm) 단계에서 동일 merchantUid에 대해 동시 요청이 들어오는 경우
     *   한 트랜잭션만 결제 상태 변경/확정 처리를 수행하도록 막기 위함
     *
     * 주의:
     * - 이 메서드는 반드시 트랜잭션 범위(@Transactional) 안에서 호출되어야 락이 의미가 있습니다.
     * - DB/트래픽 상황에 따라 대기 시간이 증가할 수 있으므로, 필요한 구간에서만 사용합니다.
     *
     * @param merchantUid 주문번호(merchantUid / orderId)
     * @return 락을 획득한 결제(Optional)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.merchantUid = :merchantUid")
    Optional<Payment> findByMerchantUidForUpdate(@Param("merchantUid") String merchantUid);

    @Query("""
            SELECT p
            FROM Payment p
            WHERE p.member.id = :memberId
              AND p.paymentStatus = com.cinema.kino.entity.enums.PaymentStatus.PAID
              AND p.paidAt IS NOT NULL
              AND p.paidAt >= :fromDateTime
            """)
    List<Payment> findPaidPaymentsByMemberIdFrom(@Param("memberId") Long memberId,
                                                 @Param("fromDateTime") LocalDateTime fromDateTime);
}
