package com.warmpaws.feedback;

import com.warmpaws.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {

    private final JdbcTemplate jdbc;

    public FeedbackController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record FeedbackRequest(
            @NotBlank(message = "反馈内容不能为空")
            @Size(min = 5, max = 500, message = "反馈内容需要 5-500 字") String content,
            @Size(max = 50, message = "联系方式最多 50 个字") String contact
    ) {
    }

    @PostMapping
    public ApiResponse<Void> submit(@RequestAttribute("userId") Long userId,
                                    @Valid @RequestBody FeedbackRequest request) {
        jdbc.update(
                "INSERT INTO feedback (user_id, content, contact) VALUES (?, ?, ?)",
                userId, request.content().trim(), request.contact() == null ? "" : request.contact().trim()
        );
        return ApiResponse.ok();
    }
}
