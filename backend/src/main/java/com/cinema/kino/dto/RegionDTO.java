package com.cinema.kino.dto;

import com.cinema.kino.entity.Region;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegionDTO {
    private Long id;
    private String name;

    public static RegionDTO from(Region region) {
        return RegionDTO.builder()
                .id(region.getId())
                .name(region.getName())
                .build();
    }
}
