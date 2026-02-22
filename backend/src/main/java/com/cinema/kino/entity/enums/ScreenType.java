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
public enum ScreenType {
    _2D("2D"),
    IMAX("IMAX"),
    _4D("4D");

    private final String value;

    @JsonValue // 객체 -> JSON (응답 시 "2D"로 출력)
    public String getValue() {
        return value;
    }

    @JsonCreator // JSON -> 객체 (요청 시 "2D"를 ScreenType._2D로 변환)
    public static ScreenType fromValue(String value) {
        return Stream.of(ScreenType.values())
                .filter(type -> type.value.equalsIgnoreCase(value))
                .findFirst()
                .orElse(null); // 혹은 에러를 던지도록 설정 가능
    }

    // --- DB 번역기(Converter) 추가 ---
    @Converter(autoApply = true)
    public static class ScreenTypeConverter implements AttributeConverter<ScreenType, String> {
        @Override
        public String convertToDatabaseColumn(ScreenType attribute) {
            return (attribute == null) ? null : attribute.getValue();
        }

        @Override
        public ScreenType convertToEntityAttribute(String dbData) {
            return (dbData == null) ? null : ScreenType.fromValue(dbData);
        }
    }
}