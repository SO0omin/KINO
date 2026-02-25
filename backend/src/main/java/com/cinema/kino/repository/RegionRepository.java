package com.cinema.kino.repository;

import com.cinema.kino.entity.Region;
import com.cinema.kino.dto.MainPageResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionRepository extends JpaRepository<Region, Long> {

    @Query("SELECT new com.cinema.kino.dto.MainPageResponseDTO$TheaterStat(r.name, COUNT(t.id)) " +
            "FROM Region r " +
            "LEFT JOIN Theater t ON t.region.id = r.id " +
            "GROUP BY r.id")
    List<MainPageResponseDTO.TheaterStat> findRegionStats();
}