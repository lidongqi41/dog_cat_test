package com.warmpaws.storage;

import com.warmpaws.common.ApiResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
public class UploadController {

    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<StorageService.StoredFile> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "submission") String bizType
    ) {
        return ApiResponse.ok(storageService.store(file, bizType));
    }
}
