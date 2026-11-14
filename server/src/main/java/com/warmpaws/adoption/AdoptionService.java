package com.warmpaws.adoption;

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
public class AdoptionService {

    private static final String SELECT = "SELECT id, animal_id, animal_name, animal_type, user_id, applicant_name, "
            + "phone, wechat, housing, experience, status, remark, created_at, reviewed_at FROM adoption";

    private static final Pattern PHONE = Pattern.compile("^1[3-9]\\d{9}$");

    private final JdbcTemplate jdbc;
    private final AnimalService animalService;

    public AdoptionService(JdbcTemplate jdbc, AnimalService animalService) {
        this.jdbc = jdbc;
        this.animalService = animalService;
    }

    public record CreateRequest(
            @NotNull(message = "animalId 不能为空") Long animalId,
            @NotBlank(message = "请填写称呼") @Size(max = 20, message = "称呼最多 20 个字") String applicantName,
            String phone,
            String wechat,
            @NotBlank(message = "请填写居住情况") @Size(max = 200, message = "居住情况最多 200 个字") String housing,
            @Size(max = 500, message = "养宠经验最多 500 个字") String experience
    ) {
    }

    public Adoption create(Long userId, CreateRequest request) {
        boolean noPhone = request.phone() == null || request.phone().isBlank();
        boolean noWechat = request.wechat() == null || request.wechat().isBlank();
        if (noPhone && noWechat) {
            throw new BizException(400, "手机号和微信号至少填一个");
        }
        if (!noPhone && !PHONE.matcher(request.phone().trim()).matches()) {
            throw new BizException(400, "手机号格式不正确");
        }

        Animal animal = animalService.detail(request.animalId());
        if (!"available".equals(animal.status())) {
            throw new BizException(409, "这只动物当前不可申请");
        }

        Integer duplicated = jdbc.queryForObject(
                "SELECT COUNT(*) FROM adoption WHERE user_id = ? AND animal_id = ? AND status = 'pending'",
                Integer.class,
                userId, request.animalId()
        );
        if (duplicated != null && duplicated > 0) {
            throw new BizException(409, "你已经提交过申请，请等待审核");
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO adoption (animal_id, animal_name, animal_type, user_id, applicant_name, phone, "
                            + "wechat, housing, experience, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, animal.id());
            ps.setString(2, animal.name());
            ps.setString(3, animal.type());
            ps.setLong(4, userId);
            ps.setString(5, request.applicantName().trim());
            ps.setString(6, request.phone() == null ? "" : request.phone().trim());
            ps.setString(7, request.wechat() == null ? "" : request.wechat().trim());
            ps.setString(8, request.housing().trim());
            ps.setString(9, request.experience() == null ? "" : request.experience().trim());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new BizException(500, "提交申请失败");
        }
        return findById(key.longValue());
    }

    public PageResult<Adoption> mine(Long userId, String status, int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 50);

        StringBuilder where = new StringBuilder(" WHERE user_id = ?");
        List<Object> args = new ArrayList<>();
        args.add(userId);
        if (status != null && !status.isBlank() && !"all".equals(status)) {
            where.append(" AND status = ?");
            args.add(status);
        }

        Long total = jdbc.queryForObject("SELECT COUNT(*) FROM adoption" + where, Long.class, args.toArray());
        long count = total == null ? 0 : total;

        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(safeSize);
        pageArgs.add((long) (safePage - 1) * safeSize);

        List<Adoption> list = jdbc.query(
                SELECT + where + " ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?",
                this::mapRow,
                pageArgs.toArray()
        );
        return PageResult.of(list, count, safePage, safeSize);
    }

    public PageResult<Adoption> adminList(String status, int page, int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 50);

        StringBuilder where = new StringBuilder(" WHERE 1 = 1");
        List<Object> args = new ArrayList<>();
        if (status != null && !status.isBlank() && !"all".equals(status)) {
            where.append(" AND status = ?");
            args.add(status);
        }

        Long total = jdbc.queryForObject("SELECT COUNT(*) FROM adoption" + where, Long.class, args.toArray());
        long count = total == null ? 0 : total;

        List<Object> pageArgs = new ArrayList<>(args);
        pageArgs.add(safeSize);
        pageArgs.add((long) (safePage - 1) * safeSize);

        List<Adoption> list = jdbc.query(
                SELECT + where + " ORDER BY created_at ASC, id ASC LIMIT ? OFFSET ?",
                this::mapRow,
                pageArgs.toArray()
        );
        return PageResult.of(list, count, safePage, safeSize);
    }

    public Adoption findById(long id) {
        List<Adoption> list = jdbc.query(SELECT + " WHERE id = ?", this::mapRow, id);
        if (list.isEmpty()) {
            throw new BizException(404, "申请不存在");
        }
        return list.get(0);
    }

    public Adoption withdraw(Long userId, long id) {
        int updated = jdbc.update(
                "UPDATE adoption SET status = 'withdrawn', remark = '用户主动撤销', reviewed_at = NOW() "
                        + "WHERE id = ? AND user_id = ? AND status = 'pending'",
                id, userId
        );
        if (updated == 0) {
            throw new BizException(409, "只有待审核的申请可以撤销");
        }
        return findById(id);
    }

    @Transactional
    public Adoption approve(long id) {
        Adoption adoption = findById(id);
        if (!"pending".equals(adoption.status())) {
            throw new BizException(409, "只有待审核的申请可以通过");
        }
        jdbc.update(
                "UPDATE adoption SET status = 'approved', remark = '审核通过', reviewed_at = NOW() WHERE id = ?",
                id
        );
        animalService.markAdopted(adoption.animalId());
        return findById(id);
    }

    public Adoption reject(long id, String reason) {
        Adoption adoption = findById(id);
        if (!"pending".equals(adoption.status())) {
            throw new BizException(409, "只有待审核的申请可以驳回");
        }
        jdbc.update(
                "UPDATE adoption SET status = 'rejected', remark = ?, reviewed_at = NOW() WHERE id = ?",
                reason == null ? "" : reason, id
        );
        return findById(id);
    }

    private Adoption mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new Adoption(
                rs.getLong("id"),
                rs.getLong("animal_id"),
                rs.getString("animal_name"),
                rs.getString("animal_type"),
                rs.getObject("user_id") == null ? null : rs.getLong("user_id"),
                rs.getString("applicant_name"),
                rs.getString("phone"),
                rs.getString("wechat"),
                rs.getString("housing"),
                rs.getString("experience"),
                rs.getString("status"),
                rs.getString("remark"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("reviewed_at") == null ? null : rs.getTimestamp("reviewed_at").toLocalDateTime()
        );
    }
}
