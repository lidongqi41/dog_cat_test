package com.warmpaws.submission;

import java.time.LocalDateTime;
import java.util.List;

public record Submission(
        Long id,
        Long userId,
        String type,
        String name,
        String gender,
        String age,
        String breed,
        boolean sterilized,
        boolean vaccinated,
        String health,
        String location,
        String story,
        List<String> images,
        String contactName,
        String phone,
        String wechat,
        String status,
        String rejectCode,
        String rejectReason,
        Long animalId,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
}
