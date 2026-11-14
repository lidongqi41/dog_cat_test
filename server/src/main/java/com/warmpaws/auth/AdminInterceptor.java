package com.warmpaws.auth;

import com.warmpaws.common.BizException;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;

    public AdminInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new BizException(401, "请先登录管理后台");
        }

        try {
            Claims claims = jwtService.parse(authorization.substring(7));
            if (!"ADMIN".equals(claims.get("role", String.class))) {
                throw new BizException(403, "没有管理员权限");
            }
            request.setAttribute("adminId", Long.valueOf(claims.getSubject()));
            return true;
        } catch (BizException e) {
            throw e;
        } catch (Exception e) {
            throw new BizException(401, "登录已过期，请重新登录管理后台");
        }
    }
}
