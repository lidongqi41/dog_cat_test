package com.warmpaws.app;

import com.warmpaws.config.AppProperties;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    private final AppProperties properties;

    public RootController(AppProperties properties) {
        this.properties = properties;
    }

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String index() {
        String version = properties.version() == null ? "unknown" : properties.version();
        return "<!doctype html><html lang=\"zh-CN\"><head><meta charset=\"utf-8\">"
                + "<title>WarmPaws API</title></head>"
                + "<body style=\"font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
                + "padding:40px;line-height:1.8;color:#222\">"
                + "<h1>暖爪 WarmPaws 后端已启动</h1>"
                + "<p>版本：" + version + "</p>"
                + "<ul>"
                + "<li><a href=\"/api/v1/health\">健康检查</a></li>"
                + "<li><a href=\"/api/v1/home\">首页数据</a></li>"
                + "<li><a href=\"/api/v1/animals?page=1&size=10\">动物列表</a></li>"
                + "</ul>"
                + "<p>管理员登录：<code>POST /api/v1/admin/auth/login</code></p>"
                + "<p>接口文档见仓库 <code>server/README.md</code>。</p>"
                + "</body></html>";
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }
}
