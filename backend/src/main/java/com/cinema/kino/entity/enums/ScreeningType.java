package com.cinema.kino.entity.enums;

public enum ScreeningType {
    NORMAL, MORNING, NIGHT;

    public static ScreeningType from(java.time.LocalTime time) {
        if (time.isBefore(java.time.LocalTime.of(10, 0))) {
            return MORNING;
        } else if (time.isAfter(java.time.LocalTime.of(22, 0))) {
            return NIGHT;
        } else {
            return NORMAL;
        }
    }

}
