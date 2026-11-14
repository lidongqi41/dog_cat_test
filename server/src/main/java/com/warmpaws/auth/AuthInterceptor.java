package com.warmpaws.auth;

import com.warmpaws.common.BizException;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private static final List<String> PUBLIC_PREFIXES = List.of(
            "/api/v1/auth/login",
            "/api/v1/health",
            "/api/v1/home",
            "/api/v1/app/",
            "/api/v1/animals",
            "/api/v1/notices",
            "/api/v1/files/",
            "/api/v1/admin/auth/login"
    );

    private final JwtService jwtService;

    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        for (String prefix : PUBLIC_PREFIXES) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new BizException(401, "请先登录");
        }

        try {
            Claims claims = jwtService.parse(authorization.substring(7));
            request.setAttribute("userId", Long.valueOf(claims.getSubject()));
            request.setAttribute("role", claims.get("role", String.class));
            return true;
        } catch (Exception e) {
            throw new BizException(401, "登录已过期，请重新进入小程序");
        }
    }
}
