package com.warmpaws.app;

import com.warmpaws.animal.Animal;
import com.warmpaws.animal.AnimalService;
import com.warmpaws.common.ApiResponse;
import com.warmpaws.common.BizException;
import com.warmpaws.config.AppProperties;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AppController {

    private final JdbcTemplate jdbc;
    private final AnimalService animalService;
    private final AppProperties properties;

    public AppController(JdbcTemplate jdbc, AnimalService animalService, AppProperties properties) {
        this.jdbc = jdbc;
        this.animalService = animalService;
        this.properties = properties;
    }

    public record Notice(Long id, String title, String content, LocalDateTime publishedAt) {
    }

    public record HomeResponse(List<Notice> notices, List<Animal> animals) {
    }

    @GetMapping("/home")
    public ApiResponse<HomeResponse> home() {
        List<Notice> notices = jdbc.query(
                "SELECT id, title, content, published_at FROM notice ORDER BY published_at DESC, id DESC LIMIT 3",
                (rs, rowNum) -> new Notice(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getTimestamp("published_at").toLocalDateTime()
                )
        );
        return ApiResponse.ok(new HomeResponse(notices, animalService.recommended(3)));
    }

    @GetMapping("/notices/{id}")
    public ApiResponse<Notice> notice(@PathVariable long id) {
        List<Notice> notices = jdbc.query(
                "SELECT id, title, content, published_at FROM notice WHERE id = ?",
                (rs, rowNum) -> new Notice(
                        rs.getLong("id"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getTimestamp("published_at").toLocalDateTime()
                ),
                id
        );
        if (notices.isEmpty()) {
            throw new BizException(404, "公告不存在");
        }
        return ApiResponse.ok(notices.get(0));
    }

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        jdbc.queryForObject("SELECT 1", Integer.class);
        return ApiResponse.ok(Map.of(
                "status", "UP",
                "db", "UP",
                "version", properties.version() == null ? "unknown" : properties.version()
        ));
    }

    @GetMapping("/app/config")
    public ApiResponse<Map<String, Object>> config() {
        List<String> types = jdbc.queryForList("SELECT type FROM agreement ORDER BY id", String.class);
        return ApiResponse.ok(Map.of(
                "version", properties.version() == null ? "unknown" : properties.version(),
                "agreementTypes", types
        ));
    }

    @GetMapping("/app/agreements/{type}")
    public ApiResponse<String> agreement(@PathVariable String type) {
        List<String> contents = jdbc.queryForList(
                "SELECT content FROM agreement WHERE type = ?",
                String.class,
                type
        );
        if (contents.isEmpty()) {
            throw new BizException(404, "协议不存在");
        }
        return ApiResponse.ok(contents.get(0));
    }
}
