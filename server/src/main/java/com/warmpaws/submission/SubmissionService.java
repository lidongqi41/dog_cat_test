package com.warmpaws.submission;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.warmpaws.animal.Animal;
import com.warmpaws.animal.AnimalService;
import com.warmpaws.common.BizException;
import com.warmpaws.common.PageResult;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class SubmissionService {

    private static final String SELECT = "SELECT id, user_id, type, name, gender, age, breed, sterilized, vaccinated, "
            + "health, location, story, images, contact_name, phone, wechat, status, reject_code, reject_reason, "
            + "animal_id, created_at, reviewed_at FROM animal_submission";

    private static final Pattern PHONE = Pattern.compile("^1[3-9]\\d{9}$");

    private final JdbcTemplate jdbc;
    private final AnimalService animalService;
    private final ObjectMapper objectMapper;

    public SubmissionService(JdbcTemplate jdbc, AnimalService animalService, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.animalService = animalService;
        this.objectMapper = objectMapper;
    }

    public record CreateRequest(
            @NotBlank(message = "请选择猫或狗") String type,
            @NotBlank(message = "请填写名字") @Size(max = 20, message = "名字最多 20 个字") String name,
            @NotBlank(message = "请选择性别") String gender,
            @NotBlank(message = "请填写年龄") @Size(max = 20, message = "年龄最多 20 个字") String age,
            @Size(max = 50, message = "品种最多 50 个字") String breed,
            boolean sterilized,
            boolean vaccinated,
            @Size(max = 200, message = "健康状况最多 200 个字") String health,
            @NotBlank(message = "请填写所在地") @Size(max = 50, message = "所在地最多 50 个字") String location,
            @NotBlank(message = "请填写救助故事")
            @Size(min = 10, max = 500, message = "救助故事需要 10-500 字") String story,
            @NotNull(message = "请至少上传一张照片")
            @Size(min = 1, max = 9, message = "照片需要 1-9 张") List<@NotBlank String> images,
            @NotBlank(message = "请填写称呼") @Size(max = 20, message = "称呼最多 20 个字") String contactName,
            String phone,
            String wechat
    ) {
    }

    public record ApproveRequest(
            String name,
            String type,
            String gender,
            String age,
            String breed,
            Boolean sterilized,
            Boolean vaccinated,
            String health,
            String location,
            String story,
            List<String> images,
            List<String> tags
    ) {
    }

    public Submission create(Long userId, CreateRequest request) {
        if (!"cat".equals(request.type()) && !"dog".equals(request.type())) {
            throw new BizException(400, "类型只能是 cat 或 dog");
        }
        if (request.images().size() > 9) {
            throw new BizException(400, "照片最多 9 张");
        }
        for (String image : request.images()) {
            if (image == null || !(image.startsWith("http://") || image.startsWith("https://"))) {
                throw new BizException(400, "照片地址不合法");
            }
        }

        boolean noPhone = request.phone() == null || request.phone().isBlank();
        boolean noWechat = request.wechat() == null || request.wechat().isBlank();
        if (noPhone && noWechat) {
            throw new BizException(400, "手机号和微信号至少填一个");
        }
        if (!noPhone && !PHONE.matcher(request.phone().trim()).matches()) {
            throw new BizException(400, "手机号格式不正确");
        }

        Integer todayCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM animal_submission WHERE user_id = ? AND created_at >= CURDATE()",
                Integer.class,
                userId
        );
        if (todayCount != null && todayCount >= 3) {
            throw new BizException(429, "今天提交次数已用完，请明天再试");
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO animal_submission (user_id, type, name, gender, age, breed, sterilized, vaccinated, "
                            + "health, location, story, images, contact_name, phone, wechat, status) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, userId);
            ps.setString(2, request.type());
            ps.setString(3, request.name().trim());
            ps.setString(4, request.gender());
            ps.setString(5, request.age().trim());
            ps.setString(6, request.breed() == null ? "" : request.breed().trim());
            ps.setBoolean(7, request.sterilized());
            ps.setBoolean(8, request.vaccinated());
            ps.setString(9, request.health() == null ? "" : request.health().trim());
            ps.setString(10, request.location().trim());
            ps.setString(11, request.story().trim());
            ps.setString(12, toJson(request.images()));
            ps.setString(13, request.contactName().trim());
            ps.setString(14, noPhone ? "" : request.phone().trim());
            ps.setString(15, noWechat ? "" : request.wechat().trim());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new BizException(500, "提交投稿失败");
        }
        return findById(key.longValue());
    }

    public PageResult<Submission> mine(Long userId, String status, int page, int size) {
        return page(" WHERE user_id = ?", userId, status, page, size, true);
    }

    public PageResult<Submission> adminList(String status, int page, int size) {
        return page(" WHERE 1 = 1", null, status, page, size, false);
    }

    private PageResult<Submission> page(String baseWhere, Long userId, String status,
                                        int page, int size, boolean onlyMine) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 50);

        StringBuilder where = new StringBuilder(baseWhere);
        List<Object> args = new ArrayList<>();
        if (onlyMine) {
            args.add(userId);
        }
        if (status != null && !status.isBlank() && !"all".equals(status)) {
            where.append(" AND status = ?");
            args.add(status);
        }

        Long total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM animal_submission" + where, Long.class, args.toArray());
        long count = total == null ? 0 : total;

        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(safeSize);
        pageArgs.add((long) (safePage - 1) * safeSize);

        String order = onlyMine ? " ORDER BY created_at DESC, id DESC" : " ORDER BY created_at ASC, id ASC";
        List<Submission> list = jdbc.query(
                SELECT + where + order + " LIMIT ? OFFSET ?",
                this::mapRow,
                pageArgs.toArray()
        );
        return PageResult.of(list, count, safePage, safeSize);
    }

    public Submission findById(long id) {
        List<Submission> list = jdbc.query(SELECT + " WHERE id = ?", this::mapRow, id);
        if (list.isEmpty()) {
            throw new BizException(404, "投稿不存在");
        }
        return list.get(0);
    }

    public Submission withdraw(Long userId, long id) {
        Submission submission = findById(id);
        if (submission.userId() == null || !submission.userId().equals(userId)) {
            throw new BizException(403, "无权操作该投稿");
        }
        if (!"pending".equals(submission.status())) {
            throw new BizException(409, "只有待审核的投稿可以撤回");
        }
        jdbc.update(
                "UPDATE animal_submission SET status = 'withdrawn', reviewed_at = NOW() WHERE id = ?",
                id
        );
        return findById(id);
    }

    @Transactional
    public Submission approve(long id, ApproveRequest override) {
        Submission submission = findById(id);
        if (!"pending".equals(submission.status())) {
            throw new BizException(409, "只有待审核的投稿可以通过");
        }

        ApproveRequest ov = override == null ? new ApproveRequest(null, null, null, null, null,
                null, null, null, null, null, null, null) : override;

        List<String> images = ov.images() != null && !ov.images().isEmpty()
                ? ov.images() : submission.images();
        List<String> tags = ov.tags() == null ? List.of() : ov.tags();

        AnimalService.Input input = new AnimalService.Input(
                pick(ov.name(), submission.name()),
                pick(ov.type(), submission.type()),
                pick(ov.gender(), submission.gender()),
                pick(ov.age(), submission.age()),
                pick(ov.breed(), submission.breed()),
                ov.sterilized() != null ? ov.sterilized() : submission.sterilized(),
                ov.vaccinated() != null ? ov.vaccinated() : submission.vaccinated(),
                pick(ov.health(), submission.health()),
                pick(ov.location(), submission.location()),
                "available",
                images.isEmpty() ? "" : images.get(0),
                images,
                pick(ov.story(), submission.story()),
                tags,
                "submission",
                id
        );

        Animal animal = animalService.create(input);
        jdbc.update(
                "UPDATE animal_submission SET status = 'approved', animal_id = ?, reviewed_at = NOW() WHERE id = ?",
                animal.id(), id
        );
        return findById(id);
    }

    public Submission reject(long id, String reasonCode, String reason) {
        Submission submission = findById(id);
        if (!"pending".equals(submission.status())) {
            throw new BizException(409, "只有待审核的投稿可以驳回");
        }
        jdbc.update(
                "UPDATE animal_submission SET status = 'rejected', reject_code = ?, reject_reason = ?, "
                        + "reviewed_at = NOW() WHERE id = ?",
                reasonCode == null ? "other" : reasonCode,
                reason == null ? "" : reason,
                id
        );
        return findById(id);
    }

    private String pick(String override, String original) {
        return override != null && !override.isBlank() ? override.trim() : original;
    }

    private Submission mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new Submission(
                rs.getLong("id"),
                rs.getObject("user_id") == null ? null : rs.getLong("user_id"),
                rs.getString("type"),
                rs.getString("name"),
                rs.getString("gender"),
                rs.getString("age"),
                rs.getString("breed"),
                rs.getBoolean("sterilized"),
                rs.getBoolean("vaccinated"),
                rs.getString("health"),
                rs.getString("location"),
                rs.getString("story"),
                parseList(rs.getString("images")),
                rs.getString("contact_name"),
                rs.getString("phone"),
                rs.getString("wechat"),
                rs.getString("status"),
                rs.getString("reject_code"),
                rs.getString("reject_reason"),
                rs.getObject("animal_id") == null ? null : rs.getLong("animal_id"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("reviewed_at") == null ? null : rs.getTimestamp("reviewed_at").toLocalDateTime()
        );
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
