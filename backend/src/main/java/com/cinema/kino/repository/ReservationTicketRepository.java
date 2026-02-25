package com.cinema.kino.repository;

import com.cinema.kino.entity.ReservationTicket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationTicketRepository extends JpaRepository<ReservationTicket, Long> {
}
