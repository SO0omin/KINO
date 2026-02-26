package com.cinema.kino.repository;

import com.cinema.kino.entity.MemberPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 회원 포인트(MemberPoint) 엔티티 데이터 접근 Repository
 *
 * 설계 전략:
 * - 포인트 적립: +값으로 저장
 * - 포인트 사용: -값으로 저장
 *
 * 즉, 모든 포인트 변동 내역을 누적 기록하고,
 * 현재 사용 가능 포인트는 SUM(point)으로 계산합니다.
 *
 * 장점:
 * - 포인트 이력 관리 용이 (감사/추적 가능)
 * - 잔액 컬럼 별도 관리 필요 없음
 */
public interface MemberPointRepository extends JpaRepository<MemberPoint, Long> {

    /**
     * 특정 회원의 현재 사용 가능 포인트 조회
     *
     * 계산 방식:
     * - 해당 회원의 모든 point 값을 합산
     * - USE는 음수로 저장되므로 자동 차감 효과
     *
     * COALESCE(SUM(...), 0):
     * - 포인트 이력이 하나도 없는 경우 NULL 반환 방지
     * - NULL 대신 0 반환
     *
     * @param memberId 회원 PK
     * @return 현재 사용 가능 포인트
     */
    @Query("SELECT COALESCE(SUM(mp.point), 0) " +
            "FROM MemberPoint mp " +
            "WHERE mp.member.id = :memberId")
    int getAvailablePointsByMemberId(@Param("memberId") Long memberId);

    @Query("""
            SELECT mp
            FROM MemberPoint mp
            WHERE mp.member.id = :memberId
              AND mp.createdAt BETWEEN :fromDateTime AND :toDateTime
            ORDER BY mp.createdAt DESC, mp.id DESC
            """)
    List<MemberPoint> findHistoriesByMemberIdAndRange(@Param("memberId") Long memberId,
                                                      @Param("fromDateTime") LocalDateTime fromDateTime,
                                                      @Param("toDateTime") LocalDateTime toDateTime);
}
