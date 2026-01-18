package com.cinema.kino.repository;

import com.cinema.kino.entity.Theater;
import com.cinema.kino.entity.enums.ScreenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long> {
    List<Theater> findByRegionId(Long regionId);
    @Query("SELECT DISTINCT s.theater FROM Screen s WHERE s.screenType = :screenType")
    List<Theater> findAllByScreenType(@Param("screenType") ScreenType screenType);
}