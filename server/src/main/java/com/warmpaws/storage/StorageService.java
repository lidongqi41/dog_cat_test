package com.warmpaws.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    StoredFile store(MultipartFile file, String bizType);

    record StoredFile(String url, String key) {
    }
}
