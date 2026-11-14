package com.warmpaws.admin;

import com.warmpaws.adoption.Adoption;
import com.warmpaws.adoption.AdoptionService;
import com.warmpaws.animal.Animal;
import com.warmpaws.animal.AnimalService;
import com.warmpaws.common.ApiResponse;
import com.warmpaws.common.PageResult;
import com.warmpaws.submission.Submission;
import com.warmpaws.submission.SubmissionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdoptionService adoptionService;
    private final SubmissionService submissionService;
    private final AnimalService animalService;

    public AdminController(AdoptionService adoptionService,
                           SubmissionService submissionService,
                           AnimalService animalService) {
        this.adoptionService = adoptionService;
        this.submissionService = submissionService;
        this.animalService = animalService;
    }

    public record AdoptionRejectRequest(@Size(max = 200, message = "原因最多 200 个字") String reason) {
    }

    public record SubmissionRejectRequest(@Size(max = 30) String reasonCode,
                                          @Size(max = 200) String reason) {
    }

    public record AnimalRequest(
            @NotBlank(message = "名字不能为空") @Size(max = 20) String name,
            @NotBlank(message = "类型不能为空") String type,
            @NotBlank(message = "性别不能为空") String gender,
            @NotBlank(message = "年龄不能为空") @Size(max = 20) String age,
            @Size(max = 50) String breed,
            boolean sterilized,
            boolean vaccinated,
            @Size(max = 200) String health,
            @NotBlank(message = "所在地不能为空") @Size(max = 50) String location,
            String status,
            String cover,
            List<String> images,
            @Size(max = 1000) String story,
            List<String> tags
    ) {
    }

    @GetMapping("/adoptions")
    public ApiResponse<PageResult<Adoption>> adoptions(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(adoptionService.adminList(status, page, size));
    }

    @PostMapping("/adoptions/{id}/approve")
    public ApiResponse<Adoption> approveAdoption(@PathVariable long id) {
        return ApiResponse.ok(adoptionService.approve(id));
    }

    @PostMapping("/adoptions/{id}/reject")
    public ApiResponse<Adoption> rejectAdoption(@PathVariable long id,
                                                @RequestBody(required = false) AdoptionRejectRequest request) {
        String reason = request == null ? "" : request.reason();
        return ApiResponse.ok(adoptionService.reject(id, reason));
    }

    @GetMapping("/submissions")
    public ApiResponse<PageResult<Submission>> submissions(
            @RequestParam(defaultValue = "pending") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(submissionService.adminList(status, page, size));
    }

    @GetMapping("/submissions/{id}")
    public ApiResponse<Submission> submission(@PathVariable long id) {
        return ApiResponse.ok(submissionService.findById(id));
    }

    @PostMapping("/submissions/{id}/approve")
    public ApiResponse<Submission> approveSubmission(
            @PathVariable long id,
            @RequestBody(required = false) SubmissionService.ApproveRequest request
    ) {
        return ApiResponse.ok(submissionService.approve(id, request));
    }

    @PostMapping("/submissions/{id}/reject")
    public ApiResponse<Submission> rejectSubmission(
            @PathVariable long id,
            @RequestBody(required = false) SubmissionRejectRequest request
    ) {
        String code = request == null ? "other" : request.reasonCode();
        String reason = request == null ? "" : request.reason();
        return ApiResponse.ok(submissionService.reject(id, code, reason));
    }

    @GetMapping("/animals")
    public ApiResponse<PageResult<Animal>> animals(
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(animalService.search(type, status, keyword, page, size));
    }

    @PostMapping("/animals")
    public ApiResponse<Animal> createAnimal(@Valid @RequestBody AnimalRequest request) {
        return ApiResponse.ok(animalService.create(toInput(request)));
    }

    @PutMapping("/animals/{id}")
    public ApiResponse<Animal> updateAnimal(@PathVariable long id,
                                            @Valid @RequestBody AnimalRequest request) {
        return ApiResponse.ok(animalService.update(id, toInput(request)));
    }

    @DeleteMapping("/animals/{id}")
    public ApiResponse<Void> deleteAnimal(@PathVariable long id) {
        animalService.delete(id);
        return ApiResponse.ok();
    }

    private AnimalService.Input toInput(AnimalRequest request) {
        return new AnimalService.Input(
                request.name(),
                request.type(),
                request.gender(),
                request.age(),
                request.breed() == null ? "" : request.breed(),
                request.sterilized(),
                request.vaccinated(),
                request.health() == null ? "" : request.health(),
                request.location(),
                request.status() == null || request.status().isBlank() ? "available" : request.status(),
                request.cover() == null ? "" : request.cover(),
                request.images() == null ? List.of() : request.images(),
                request.story() == null ? "" : request.story(),
                request.tags() == null ? List.of() : request.tags(),
                "official",
                null
        );
    }
}
