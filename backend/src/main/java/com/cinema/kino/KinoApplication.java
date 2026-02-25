package com.cinema.kino;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class KinoApplication {

    public static void main(String[] args) {
        SpringApplication.run(KinoApplication.class, args);
    }

}
