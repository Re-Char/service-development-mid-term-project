package com.example.mid_term_project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // 使用 BCrypt 加密算法，strength 默认为 10
        // strength 越大，加密强度越高，但计算时间也越长
        return new BCryptPasswordEncoder();
    }
}
