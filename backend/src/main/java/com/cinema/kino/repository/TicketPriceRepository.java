package com.cinema.kino.repository;

import com.cinema.kino.entity.TicketPrice;
import com.cinema.kino.entity.enums.ScreenType;
import com.cinema.kino.entity.enums.ScreeningType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketPriceRepository extends JpaRepository<TicketPrice, Long> {

    List<TicketPrice> findByScreenTypeAndScreeningType(ScreenType screenType, ScreeningType screeningType);
}