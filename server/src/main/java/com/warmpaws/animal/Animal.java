package com.warmpaws.animal;

import java.time.LocalDateTime;
import java.util.List;

public record Animal(
        Long id,
        String name,
        String type,
        String gender,
        String age,
        String breed,
        boolean sterilized,
        boolean vaccinated,
        String health,
        String location,
        String status,
        String cover,
        List<String> images,
        String story,
        List<String> tags,
        String source,
        Long submissionId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
