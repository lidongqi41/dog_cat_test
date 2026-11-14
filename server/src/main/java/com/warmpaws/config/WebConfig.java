package com.warmpaws.config;

import com.warmpaws.auth.AdminInterceptor;
import com.warmpaws.auth.AuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final AdminInterceptor adminInterceptor;
    private final AppProperties properties;

    public WebConfig(AuthInterceptor authInterceptor, AdminInterceptor adminInterceptor, AppProperties properties) {
        this.authInterceptor = authInterceptor;
        this.adminInterceptor = adminInterceptor;
        this.properties = properties;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/v1/**")
                .excludePathPatterns(
                        "/api/v1/auth/login",
                        "/api/v1/health",
                        "/api/v1/home",
                        "/api/v1/app/**",
                        "/api/v1/animals/**",
                        "/api/v1/notices/**",
                        "/api/v1/files/**",
                        "/api/v1/admin/**"
                );

        registry.addInterceptor(adminInterceptor)
                .addPathPatterns("/api/v1/admin/**")
                .excludePathPatterns("/api/v1/admin/auth/login");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("*")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String dir = Paths.get(properties.storage().localDir())
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();
        if (!dir.endsWith("/")) {
            dir = dir + "/";
        }
        registry.addResourceHandler("/api/v1/files/**").addResourceLocations(dir);
    }
}
