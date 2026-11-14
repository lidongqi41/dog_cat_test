package com.warmpaws.animal;

import com.warmpaws.common.ApiResponse;
import com.warmpaws.common.PageResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/animals")
public class AnimalController {

    private final AnimalService animalService;

    public AnimalController(AnimalService animalService) {
        this.animalService = animalService;
    }

    @GetMapping
    public ApiResponse<PageResult<Animal>> list(
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(animalService.search(type, status, keyword, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<Animal> detail(@PathVariable long id) {
        return ApiResponse.ok(animalService.detail(id));
    }
}
