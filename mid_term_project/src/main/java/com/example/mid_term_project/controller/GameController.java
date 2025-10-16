package com.example.mid_term_project.controller;

import com.example.mid_term_project.entity.User;
import com.example.mid_term_project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
public class GameController {

    @Autowired
    private UserService userService;

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/game")
    public String game(HttpSession session) {
        // 检查用户是否已登录
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/";
        }
        return "game";
    }

    @PostMapping("/login")
    @ResponseBody
    public Map<String, Object> login(@RequestBody Map<String, String> loginData, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String username = loginData.get("username");
        String password = loginData.get("password");

        // 验证输入
        if (username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "用户名或密码不能为空");
            return response;
        }

        // 使用数据库验证登录
        Optional<User> userOptional = userService.login(username, password);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // 登录成功，将用户信息存入 session
            session.setAttribute("user", user); // 存储完整的 User 对象
            session.setAttribute("username", user.getUsername());
            session.setAttribute("userId", user.getId());
            response.put("success", true);
            response.put("message", "登录成功");
        } else {
            response.put("success", false);
            response.put("message", "用户名或密码错误");
        }

        return response;
    }

    @PostMapping("/register")
    @ResponseBody
    public Map<String, Object> register(@RequestBody Map<String, String> registerData) {
        Map<String, Object> response = new HashMap<>();

        String username = registerData.get("username");
        String password = registerData.get("password");

        // 验证输入
        if (username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "用户名或密码不能为空");
            return response;
        }

        try {
            User user = userService.register(username, password);
            response.put("success", true);
            response.put("message", "注册成功");
            response.put("userId", user.getId());
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        }

        return response;
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
}