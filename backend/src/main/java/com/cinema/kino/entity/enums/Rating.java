package com.cinema.kino.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import java.util.stream.Stream;

@Getter
@RequiredArgsConstructor
public enum Rating {
    ALL("ALL"),     //전체 관람가
    AGE_12("12"),   //12게
    AGE_15("15"),   //15세
    AGE_18("18");   //청불

    private final String value;

    @JsonValue  // 객체 -> JSON
    public String getValue() { return value; }

    @JsonCreator     // JSON -> 객체
    public static Rating fromValue(String value) {
        return Stream.of(Rating.values())
                .filter(r -> r.value.equalsIgnoreCase(value))
                .findFirst()
                .orElse(null);
    }

    @Converter(autoApply = true)
    public static class RatingConverter implements AttributeConverter<Rating, String> {
        @Override
        public String convertToDatabaseColumn(Rating rating) {
            return (rating == null) ? null : rating.getValue(); // Enum -> DB ("12")
        }

        @Override
        public Rating convertToEntityAttribute(String dbData) {
            return (dbData == null) ? null : Rating.fromValue(dbData); // DB -> Enum (AGE_12)
        }
    }
}