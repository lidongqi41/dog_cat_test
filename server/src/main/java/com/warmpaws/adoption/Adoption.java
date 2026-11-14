package com.warmpaws.adoption;

import java.time.LocalDateTime;

public record Adoption(
        Long id,
        Long animalId,
        String animalName,
        String animalType,
        Long userId,
        String applicantName,
        String phone,
        String wechat,
        String housing,
        String experience,
        String status,
        String remark,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
}
