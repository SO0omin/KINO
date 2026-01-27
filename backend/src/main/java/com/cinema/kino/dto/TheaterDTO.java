package com.cinema.kino.dto;

import com.cinema.kino.entity.Theater;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TheaterDTO {
    private Long id;
    private String name;
    private String address;

    public static TheaterDTO from(Theater theater) {
        return TheaterDTO.builder()
                .id(theater.getId())
                .name(theater.getName())
                .address(theater.getAddress())
                .build();
    }
}
