package com.example.mid_term_project.controller;

import com.example.mid_term_project.entity.GameConfig;
import com.example.mid_term_project.entity.GameScore;
import com.example.mid_term_project.entity.User;
import com.example.mid_term_project.service.GameConfigService;
import com.example.mid_term_project.service.GameScoreService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameApiController {

    @Autowired
    private GameConfigService gameConfigService;

    @Autowired
    private GameScoreService gameScoreService;

    /**
     * 获取用户的游戏配置
     */
    @GetMapping("/config")
    public ResponseEntity<?> getConfig(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }

        GameConfig config = gameConfigService.getOrCreateConfig(user.getId());
        return ResponseEntity.ok(config);
    }

    /**
     * 保存用户的游戏配置
     */
    @PostMapping("/config")
    public ResponseEntity<?> saveConfig(@RequestBody GameConfig config, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }

        GameConfig savedConfig = gameConfigService.saveConfig(user.getId(), config);
        return ResponseEntity.ok(savedConfig);
    }

    /**
     * 保存游戏成绩
     */
    @PostMapping("/score")
    public ResponseEntity<?> saveScore(@RequestBody Map<String, Object> scoreData, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }

        Integer score = (Integer) scoreData.get("score");
        Integer gameMode = (Integer) scoreData.get("gameMode");
        Double cps = scoreData.get("cps") != null ? ((Number) scoreData.get("cps")).doubleValue() : null;

        GameScore savedScore = gameScoreService.saveScore(user.getId(), score, gameMode, cps);
        return ResponseEntity.ok(savedScore);
    }

    /**
     * 获取最佳成绩
     */
    @GetMapping("/best-score")
    public ResponseEntity<?> getBestScore(@RequestParam Integer gameMode, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }

        Map<String, Object> bestScore = gameScoreService.getBestScore(user.getId(), gameMode);
        return ResponseEntity.ok(bestScore);
    }

    /**
     * 获取历史成绩
     */
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestParam Integer gameMode, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }

        List<GameScore> history = gameScoreService.getHistory(user.getId(), gameMode);
        return ResponseEntity.ok(history);
    }
}
