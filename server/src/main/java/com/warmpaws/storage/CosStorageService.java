package com.warmpaws.storage;

import com.qcloud.cos.COSClient;
import com.qcloud.cos.ClientConfig;
import com.qcloud.cos.auth.BasicCOSCredentials;
import com.qcloud.cos.model.ObjectMetadata;
import com.qcloud.cos.model.PutObjectRequest;
import com.qcloud.cos.region.Region;
import com.warmpaws.common.BizException;
import com.warmpaws.config.AppProperties;
import jakarta.annotation.PreDestroy;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "cos")
public class CosStorageService implements StorageService {

    private static final Set<String> ALLOWED = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final long MAX_SIZE = 5L * 1024 * 1024;

    private final COSClient client;
    private final String bucket;
    private final String region;
    private final String domain;

    public CosStorageService(AppProperties properties) {
        AppProperties.Storage.Cos cos = properties.storage().cos();
        if (cos == null || blank(cos.secretId()) || blank(cos.secretKey())
                || blank(cos.region()) || blank(cos.bucket())) {
            throw new IllegalStateException("COS 配置不完整：请设置 COS_SECRET_ID / COS_SECRET_KEY / COS_REGION / COS_BUCKET");
        }
        this.bucket = cos.bucket();
        this.region = cos.region();
        this.domain = blank(cos.domain())
                ? "https://" + cos.bucket() + ".cos." + cos.region() + ".myqcloud.com"
                : cos.domain().replaceAll("/+$", "");
        this.client = new COSClient(
                new BasicCOSCredentials(cos.secretId(), cos.secretKey()),
                new ClientConfig(new Region(cos.region()))
        );
    }

    @Override
    public StoredFile store(MultipartFile file, String bizType) {
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
        String extension = extension(file.getOriginalFilename());
        if (!ALLOWED.contains(extension)) {
            throw new BizException(400, "只支持 jpg / png / webp");
        }

        String safeBiz = bizType != null && bizType.matches("[a-z0-9-]{1,20}") ? bizType : "submission";
        String key = safeBiz + "/" + UUID.randomUUID().toString().replace("-", "") + extension;

        try (InputStream in = file.getInputStream()) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(contentType);
            client.putObject(new PutObjectRequest(bucket, key, in, metadata));
        } catch (Exception e) {
            throw new BizException(500, "图片上传失败");
        }

        return new StoredFile(domain + "/" + key, key);
    }

    @PreDestroy
    public void shutdown() {
        if (client != null) {
            client.shutdown();
        }
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private String extension(String filename) {
        if (filename == null) {
            return "";
        }
        int index = filename.lastIndexOf('.');
        return index < 0 ? "" : filename.substring(index).toLowerCase();
    }
}
