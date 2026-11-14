package com.warmpaws.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String version,
        String publicBaseUrl,
        Jwt jwt,
        Wx wx,
        Storage storage
) {

    public record Jwt(String secret, long expireSeconds) {
    }

    public record Wx(String appid, String secret, boolean mock) {
    }

    public record Storage(String type, String localDir, Cos cos) {

        public record Cos(String secretId, String secretKey, String region, String bucket, String domain) {
        }
    }
}
