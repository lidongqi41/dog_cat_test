package com.warmpaws.submission;

import com.warmpaws.common.ApiResponse;
import com.warmpaws.common.PageResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public ApiResponse<Submission> create(@RequestAttribute("userId") Long userId,
                                          @Valid @RequestBody SubmissionService.CreateRequest request) {
        return ApiResponse.ok(submissionService.create(userId, request));
    }

    @GetMapping("/mine")
    public ApiResponse<PageResult<Submission>> mine(
            @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(submissionService.mine(userId, status, page, size));
    }

    @PostMapping("/{id}/withdraw")
    public ApiResponse<Submission> withdraw(@RequestAttribute("userId") Long userId,
                                            @PathVariable long id) {
        return ApiResponse.ok(submissionService.withdraw(userId, id));
    }
}
