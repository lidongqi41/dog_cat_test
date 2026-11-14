package com.warmpaws.user;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final JdbcTemplate jdbc;

    public UserService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record User(Long id, String openid, String nickname, String role, LocalDateTime createdAt) {
    }

    public record View(Long id, String nickname, String role) {
    }

    public Optional<User> findByOpenid(String openid) {
        List<User> users = jdbc.query(
                "SELECT id, openid, nickname, role, created_at FROM app_user WHERE openid = ?",
                (rs, rowNum) -> new User(
                        rs.getLong("id"),
                        rs.getString("openid"),
                        rs.getString("nickname"),
                        rs.getString("role"),
                        rs.getTimestamp("created_at").toLocalDateTime()
                ),
                openid
        );
        return users.stream().findFirst();
    }

    public User findById(Long id) {
        List<User> users = jdbc.query(
                "SELECT id, openid, nickname, role, created_at FROM app_user WHERE id = ?",
                (rs, rowNum) -> new User(
                        rs.getLong("id"),
                        rs.getString("openid"),
                        rs.getString("nickname"),
                        rs.getString("role"),
                        rs.getTimestamp("created_at").toLocalDateTime()
                ),
                id
        );
        return users.stream().findFirst().orElse(null);
    }

    public User create(String openid) {
        jdbc.update("INSERT INTO app_user (openid, nickname, role) VALUES (?, ?, 'USER')", openid, "微信用户");
        return findByOpenid(openid).orElseThrow();
    }

    public User updateNickname(Long id, String nickname) {
        jdbc.update("UPDATE app_user SET nickname = ? WHERE id = ?", nickname, id);
        return findById(id);
    }

    public View toView(User user) {
        return user == null ? null : new View(user.id(), user.nickname(), user.role());
    }

    /**
     * 注销：删账号/收藏/反馈；已审核的申请与投稿保留并脱钩；待审核的直接删除
     */
    @Transactional
    public void deleteAccount(Long userId) {
        jdbc.update("DELETE FROM adoption WHERE user_id = ? AND status = 'pending'", userId);
        jdbc.update("UPDATE adoption SET user_id = NULL WHERE user_id = ?", userId);

        jdbc.update("DELETE FROM animal_submission WHERE user_id = ? AND status IN ('pending', 'rejected', 'withdrawn')", userId);
        jdbc.update("UPDATE animal_submission SET user_id = NULL WHERE user_id = ?", userId);

        jdbc.update("DELETE FROM favorite WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM feedback WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM app_user WHERE id = ?", userId);
    }
}
