package com.warmpaws.adoption;

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
@RequestMapping("/api/v1/adoptions")
public class AdoptionController {

    private final AdoptionService adoptionService;

    public AdoptionController(AdoptionService adoptionService) {
        this.adoptionService = adoptionService;
    }

    @PostMapping
    public ApiResponse<Adoption> create(@RequestAttribute("userId") Long userId,
                                        @Valid @RequestBody AdoptionService.CreateRequest request) {
        return ApiResponse.ok(adoptionService.create(userId, request));
    }

    @GetMapping("/mine")
    public ApiResponse<PageResult<Adoption>> mine(
            @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(adoptionService.mine(userId, status, page, size));
    }

    @PostMapping("/{id}/withdraw")
    public ApiResponse<Adoption> withdraw(@RequestAttribute("userId") Long userId,
                                          @PathVariable long id) {
        return ApiResponse.ok(adoptionService.withdraw(userId, id));
    }
}
