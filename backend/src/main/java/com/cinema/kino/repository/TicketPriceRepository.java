package com.cinema.kino.repository;

import com.cinema.kino.entity.TicketPrice;
import com.cinema.kino.entity.enums.PriceType;
import com.cinema.kino.entity.enums.ScreenType;
import com.cinema.kino.entity.enums.ScreeningType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketPriceRepository extends JpaRepository<TicketPrice, Long> {

    Optional<TicketPrice> findByScreenTypeAndPriceTypeAndScreeningType(
            ScreenType screenType,
            PriceType priceType,
            ScreeningType screeningType
    );
}