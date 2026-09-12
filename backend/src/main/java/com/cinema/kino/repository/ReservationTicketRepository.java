package com.cinema.kino.repository;

import com.cinema.kino.entity.ReservationTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReservationTicketRepository extends JpaRepository<ReservationTicket, Long> {

    /* =========================================================
       옵션 1: 물리적 삭제 (Hard Delete) - 아예 DB에서 지워버리기
       ========================================================= */
    // Spring Data JPA가 이름만 보고 자동으로 DELETE 쿼리를 짜줍니다!
    // (만약 엔티티 안에 필드명이 reservation이고 그 안의 id를 참조한다면 deleteAllByReservation_Id 로 써야 할 수도 있습니다)
    void deleteAllByReservationId(Long reservationId);

    Optional<ReservationTicket> findByTicketCode(String ticketCode);

}