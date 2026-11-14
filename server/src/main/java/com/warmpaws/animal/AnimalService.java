package com.warmpaws.animal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.warmpaws.common.BizException;
import com.warmpaws.common.PageResult;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnimalService {

    private static final String SELECT = "SELECT id, name, type, gender, age, breed, sterilized, vaccinated, "
            + "health, location, status, cover, images, story, tags, source, submission_id, created_at, updated_at "
            + "FROM animal";

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public AnimalService(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    public record Input(
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
            Long submissionId
    ) {
    }

    public RowMapper<Animal> mapper() {
        return (rs, rowNum) -> new Animal(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("type"),
                rs.getString("gender"),
                rs.getString("age"),
                rs.getString("breed"),
                rs.getBoolean("sterilized"),
                rs.getBoolean("vaccinated"),
                rs.getString("health"),
                rs.getString("location"),
                rs.getString("status"),
                rs.getString("cover"),
                parseList(rs.getString("images")),
                rs.getString("story"),
                parseList(rs.getString("tags")),
                rs.getString("source"),
                rs.getObject("submission_id") == null ? null : rs.getLong("submission_id"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("updated_at").toLocalDateTime()
        );
    }

    public PageResult<Animal> search(String type, String status, String keyword, int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 50);

        StringBuilder where = new StringBuilder(" WHERE 1 = 1");
        List<Object> args = new ArrayList<>();

        if (type != null && !type.isBlank() && !"all".equals(type)) {
            where.append(" AND type = ?");
            args.add(type);
        }
        if (status != null && !status.isBlank() && !"all".equals(status)) {
            where.append(" AND status = ?");
            args.add(status);
        }
        if (keyword != null && !keyword.isBlank()) {
            String like = "%" + keyword.trim() + "%";
            where.append(" AND (name LIKE ? OR breed LIKE ? OR location LIKE ? OR story LIKE ?)");
            args.add(like);
            args.add(like);
            args.add(like);
            args.add(like);
        }

        Long total = jdbc.queryForObject("SELECT COUNT(*) FROM animal" + where, Long.class, args.toArray());
        long count = total == null ? 0 : total;

        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(safeSize);
        pageArgs.add((long) (safePage - 1) * safeSize);

        List<Animal> list = jdbc.query(
                SELECT + where + " ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?",
                mapper(),
                pageArgs.toArray()
        );

        return PageResult.of(list, count, safePage, safeSize);
    }

    public Animal detail(long id) {
        List<Animal> list = jdbc.query(SELECT + " WHERE id = ?", mapper(), id);
        if (list.isEmpty()) {
            throw new BizException(404, "动物不存在或已下架");
        }
        return list.get(0);
    }

    public List<Animal> recommended(int limit) {
        return jdbc.query(
                SELECT + " WHERE status = 'available' ORDER BY created_at DESC, id DESC LIMIT ?",
                mapper(),
                limit
        );
    }

    public Animal create(Input input) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO animal (name, type, gender, age, breed, sterilized, vaccinated, health, location, "
                            + "status, cover, images, story, tags, source, submission_id) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, input.name());
            ps.setString(2, input.type());
            ps.setString(3, input.gender());
            ps.setString(4, input.age());
            ps.setString(5, input.breed());
            ps.setBoolean(6, input.sterilized());
            ps.setBoolean(7, input.vaccinated());
            ps.setString(8, input.health());
            ps.setString(9, input.location());
            ps.setString(10, input.status());
            ps.setString(11, input.cover());
            ps.setString(12, toJson(input.images()));
            ps.setString(13, input.story());
            ps.setString(14, toJson(input.tags()));
            ps.setString(15, input.source());
            if (input.submissionId() == null) {
                ps.setNull(16, java.sql.Types.BIGINT);
            } else {
                ps.setLong(16, input.submissionId());
            }
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new BizException(500, "创建动物档案失败");
        }
        return detail(key.longValue());
    }

    public Animal update(long id, Input input) {
        int updated = jdbc.update(
                "UPDATE animal SET name = ?, type = ?, gender = ?, age = ?, breed = ?, sterilized = ?, "
                        + "vaccinated = ?, health = ?, location = ?, status = ?, cover = ?, images = ?, "
                        + "story = ?, tags = ? WHERE id = ?",
                input.name(), input.type(), input.gender(), input.age(), input.breed(),
                input.sterilized(), input.vaccinated(), input.health(), input.location(), input.status(),
                input.cover(), toJson(input.images()), input.story(), toJson(input.tags()), id
        );
        if (updated == 0) {
            throw new BizException(404, "动物不存在");
        }
        return detail(id);
    }

    public void delete(long id) {
        int deleted = jdbc.update("DELETE FROM animal WHERE id = ?", id);
        if (deleted == 0) {
            throw new BizException(404, "动物不存在");
        }
    }

    public void markAdopted(long id) {
        jdbc.update("UPDATE animal SET status = 'adopted' WHERE id = ?", id);
    }

    private List<String> parseList(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            return List.of();
        }
    }

    private String toJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? List.of() : values);
        } catch (Exception e) {
            return "[]";
        }
    }
}
