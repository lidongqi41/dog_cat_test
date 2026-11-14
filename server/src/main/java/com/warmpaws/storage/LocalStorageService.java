package com.warmpaws.storage;

import com.warmpaws.common.BizException;
import com.warmpaws.config.AppProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final Set<String> ALLOWED = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final long MAX_SIZE = 5L * 1024 * 1024;

    private final Path root;
    private final String publicBaseUrl;

    public LocalStorageService(AppProperties properties) {
        this.root = Paths.get(properties.storage().localDir()).toAbsolutePath().normalize();
        this.publicBaseUrl = properties.publicBaseUrl().replaceAll("/+$", "");
        try {
            Files.createDirectories(root);
        } catch (Exception e) {
            throw new IllegalStateException("无法创建上传目录: " + root, e);
        }
    }

    @Override
    public StoredFile store(MultipartFile file, String bizType) {
        validate(file);

        String extension = extension(file.getOriginalFilename());
        String safeBiz = bizType != null && bizType.matches("[a-z0-9-]{1,20}") ? bizType : "submission";
        String key = safeBiz + "/" + UUID.randomUUID().toString().replace("-", "") + extension;
        Path target = root.resolve(key).normalize();

        if (!target.startsWith(root)) {
            throw new BizException(400, "非法的上传路径");
        }

        try {
            Files.createDirectories(target.getParent());
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (Exception e) {
            throw new BizException(500, "图片保存失败");
        }

        return new StoredFile(publicBaseUrl + "/api/v1/files/" + key, key);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BizException(400, "请选择图片");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BizException(400, "图片超过 5MB，请压缩后重试");
        }
        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/")
                && !"application/octet-stream".equals(contentType)) {
            throw new BizException(400, "只允许上传图片");
        }
        if (!ALLOWED.contains(extension(file.getOriginalFilename()))) {
            throw new BizException(400, "只支持 jpg / png / webp");
        }
    }

    private String extension(String filename) {
        if (filename == null) {
            return "";
        }
        int index = filename.lastIndexOf('.');
        return index < 0 ? "" : filename.substring(index).toLowerCase();
    }
}
