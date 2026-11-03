package com.fraudgraph;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FraudGraphApplication {

    public static void main(String[] args) {
        SpringApplication.run(FraudGraphApplication.class, args);
    }
}
