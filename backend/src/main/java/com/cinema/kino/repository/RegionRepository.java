package com.cinema.kino.repository;

import com.cinema.kino.dto.TheaterStatDTO;
import com.cinema.kino.entity.Region;
import com.cinema.kino.dto.MainPageResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionRepository extends JpaRepository<Region, Long> {

    @Query("SELECT new com.cinema.kino.dto.TheaterStatDTO(r.name, COUNT(t.id)) " +
            "FROM Region r " +
            "LEFT JOIN Theater t ON t.region = r " + // ON t.region.id = r.id 보다 객체 연관관계를 직접 활용
            "GROUP BY r.id, r.name") // GROUP BY 조건에 r.name 추가
    List<TheaterStatDTO> findRegionStats();

    @Query("SELECT r FROM Region r " +
            "LEFT JOIN Theater t ON t.region = r " +
            "GROUP BY r.id, r.name " +
            "ORDER BY COUNT(t.id) DESC")
    List<Region> findAllOrderByTheaterCountDesc();

}