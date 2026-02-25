package com.cinema.kino.repository;

import com.cinema.kino.entity.Reservation;
import com.cinema.kino.entity.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByOrderId(String orderId);

    @Query("""
            SELECT r FROM Reservation r
            JOIN FETCH r.screening s
            JOIN FETCH s.movie
            JOIN FETCH s.screen sc
            JOIN FETCH sc.theater
            WHERE r.member.id = :memberId
            ORDER BY r.createdAt DESC
            """)
    List<Reservation> findMyReservationsWithScreening(@Param("memberId") Long memberId);

    long countByMemberIdAndStatus(Long memberId, ReservationStatus status);
}
