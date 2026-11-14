package com.warmpaws;

import com.warmpaws.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class WarmPawsApplication {

    public static void main(String[] args) {
        SpringApplication.run(WarmPawsApplication.class, args);
    }
}
