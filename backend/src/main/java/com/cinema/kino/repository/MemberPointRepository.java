package com.cinema.kino.repository;

import com.cinema.kino.entity.MemberPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberPointRepository extends JpaRepository<MemberPoint, Long> {

    // [계산] 단순히 모든 포인트 변화량을 합산 (USE를 음수로 저장하는 전략)
    @Query("SELECT COALESCE(SUM(mp.point), 0) FROM MemberPoint mp WHERE mp.member.id = :memberId")
    int getAvailablePointsByMemberId(@Param("memberId") Long memberId);
}