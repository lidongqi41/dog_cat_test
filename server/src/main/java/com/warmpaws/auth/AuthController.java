package com.warmpaws.auth;

import com.warmpaws.common.ApiResponse;
import com.warmpaws.common.BizException;
import com.warmpaws.config.AppProperties;
import com.warmpaws.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AppProperties properties;
    private final JdbcTemplate jdbc;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserService userService, JwtService jwtService, AppProperties properties, JdbcTemplate jdbc) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.properties = properties;
        this.jdbc = jdbc;
    }

    @PostMapping("/auth/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String openid;
        if (properties.wx().mock() || request.code().startsWith("mock-")) {
            openid = "mock-openid";
        } else {
            openid = exchangeCode(request.code());
        }

        UserService.User user = userService.findByOpenid(openid)
                .orElseGet(() -> userService.create(openid));
        String token = jwtService.create(user.id(), user.role());
        return ApiResponse.ok(new LoginResponse(token, jwtService.expireSeconds(), userService.toView(user)));
    }

    @GetMapping("/users/me")
    public ApiResponse<UserService.View> me(@RequestAttribute("userId") Long userId) {
        UserService.User user = userService.findById(userId);
        if (user == null) {
            throw new BizException(404, "用户不存在");
        }
        return ApiResponse.ok(userService.toView(user));
    }

    @PutMapping("/users/me")
    public ApiResponse<UserService.View> updateMe(@RequestAttribute("userId") Long userId,
                                                  @Valid @RequestBody NicknameRequest request) {
        UserService.User user = userService.updateNickname(userId, request.nickname());
        return ApiResponse.ok(userService.toView(user));
    }

    @DeleteMapping("/users/me")
    public ApiResponse<Void> deleteMe(@RequestAttribute("userId") Long userId) {
        userService.deleteAccount(userId);
        return ApiResponse.ok();
    }

    @PostMapping("/admin/auth/login")
    public ApiResponse<AdminLoginResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT id, username, password_hash, nickname FROM admin_user WHERE username = ?",
                request.username()
        );
        if (rows.isEmpty()) {
            throw new BizException(401, "账号或密码错误");
        }
        Map<String, Object> row = rows.get(0);
        if (!encoder.matches(request.password(), String.valueOf(row.get("password_hash")))) {
            throw new BizException(401, "账号或密码错误");
        }
        Long adminId = ((Number) row.get("id")).longValue();
        String token = jwtService.create(adminId, "ADMIN");
        AdminView admin = new AdminView(adminId, String.valueOf(row.get("username")), String.valueOf(row.get("nickname")));
        return ApiResponse.ok(new AdminLoginResponse(token, jwtService.expireSeconds(), admin));
    }

    private String exchangeCode(String code) {
        AppProperties.Wx wx = properties.wx();
        if (wx.appid() == null || wx.appid().isBlank() || wx.secret() == null || wx.secret().isBlank()) {
            throw new BizException(500, "后端未配置微信 AppID/Secret");
        }

        String url = "https://api.weixin.qq.com/sns/jscode2session"
                + "?appid=" + wx.appid()
                + "&secret=" + wx.secret()
                + "&js_code=" + code
                + "&grant_type=authorization_code";

        WxSession session = RestClient.create().get().uri(url).retrieve().body(WxSession.class);
        if (session == null || session.openid() == null || session.openid().isBlank()) {
            String reason = session == null ? "无响应" : session.errmsg();
            throw new BizException(500, "微信登录失败：" + reason);
        }
        return session.openid();
    }

    public record LoginRequest(@NotBlank(message = "code 不能为空") String code) {
    }

    public record LoginResponse(String token, long expiresIn, UserService.View user) {
    }

    public record NicknameRequest(@NotBlank(message = "昵称不能为空")
                                  @Size(max = 20, message = "昵称最多 20 个字") String nickname) {
    }

    public record AdminLoginRequest(@NotBlank(message = "用户名不能为空") String username,
                                    @NotBlank(message = "密码不能为空") String password) {
    }

    public record AdminLoginResponse(String token, long expiresIn, AdminView admin) {
    }

    public record AdminView(Long id, String username, String nickname) {
    }

    public record WxSession(String openid, Integer errcode, String errmsg) {
    }
}
