package com.warmpaws.favorite;

import com.warmpaws.animal.Animal;
import com.warmpaws.animal.AnimalService;
import com.warmpaws.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteController {

    private final JdbcTemplate jdbc;
    private final AnimalService animalService;

    public FavoriteController(JdbcTemplate jdbc, AnimalService animalService) {
        this.jdbc = jdbc;
        this.animalService = animalService;
    }

    public record FavoriteRequest(@NotNull(message = "animalId 不能为空") Long animalId) {
    }

    @GetMapping
    public ApiResponse<List<Animal>> list(@RequestAttribute("userId") Long userId) {
        List<Animal> list = jdbc.query(
                "SELECT a.* FROM favorite f JOIN animal a ON a.id = f.animal_id "
                        + "WHERE f.user_id = ? ORDER BY f.created_at DESC",
                animalService.mapper(),
                userId
        );
        return ApiResponse.ok(list);
    }

    @PostMapping
    public ApiResponse<Void> add(@RequestAttribute("userId") Long userId,
                                 @Valid @RequestBody FavoriteRequest request) {
        animalService.detail(request.animalId());
        jdbc.update("INSERT IGNORE INTO favorite (user_id, animal_id) VALUES (?, ?)",
                userId, request.animalId());
        return ApiResponse.ok();
    }

    @DeleteMapping("/{animalId}")
    public ApiResponse<Void> remove(@RequestAttribute("userId") Long userId,
                                    @PathVariable long animalId) {
        jdbc.update("DELETE FROM favorite WHERE user_id = ? AND animal_id = ?", userId, animalId);
        return ApiResponse.ok();
    }

    @GetMapping("/{animalId}/status")
    public ApiResponse<Boolean> status(@RequestAttribute("userId") Long userId,
                                       @PathVariable long animalId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM favorite WHERE user_id = ? AND animal_id = ?",
                Integer.class,
                userId, animalId
        );
        return ApiResponse.ok(count != null && count > 0);
    }
}
