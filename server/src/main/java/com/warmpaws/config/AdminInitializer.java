package com.warmpaws.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final JdbcTemplate jdbc;
    private final String username;
    private final String password;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AdminInitializer(JdbcTemplate jdbc,
                            @Value("${ADMIN_USERNAME:admin}") String username,
                            @Value("${ADMIN_PASSWORD:admin123}") String password) {
        this.jdbc = jdbc;
        this.username = username;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM admin_user", Long.class);
        if (count != null && count == 0) {
            jdbc.update(
                    "INSERT INTO admin_user (username, password_hash, nickname) VALUES (?, ?, ?)",
                    username, encoder.encode(password), "管理员"
            );
            log.warn("已创建默认管理员 {}，请尽快修改密码", username);
        }
    }
}
