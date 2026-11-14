package com.warmpaws.common;

import java.util.List;

public record PageResult<T>(List<T> list, long total, int page, int size, boolean hasMore) {

    public static <T> PageResult<T> of(List<T> list, long total, int page, int size) {
        long offset = (long) (page - 1) * size;
        return new PageResult<>(list, total, page, size, offset + list.size() < total);
    }
}
