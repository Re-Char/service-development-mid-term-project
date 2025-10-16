package com.example.mid_term_project.service;

import com.example.mid_term_project.entity.GameScore;
import com.example.mid_term_project.repository.GameScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GameScoreService {

    @Autowired
    private GameScoreRepository gameScoreRepository;

    /**
     * 保存游戏成绩
     */
    public GameScore saveScore(Long userId, Integer score, Integer gameMode, Double cps) {
        GameScore gameScore = new GameScore();
        gameScore.setUserId(userId);
        gameScore.setScore(score);
        gameScore.setGameMode(gameMode);
        gameScore.setCps(cps);
        return gameScoreRepository.save(gameScore);
    }

    /**
     * 获取用户的最佳成绩
     */
    public Map<String, Object> getBestScore(Long userId, Integer gameMode) {
        Map<String, Object> result = new HashMap<>();

        if (gameMode == 1) { // 普通模式
            Integer bestScore = gameScoreRepository.findBestScoreByUserIdAndGameMode(userId, gameMode)
                    .orElse(0);
            result.put("bestScore", bestScore);
        } else if (gameMode == 2) { // 无尽模式
            Double bestCps = gameScoreRepository.findBestCpsByUserIdAndGameMode(userId, gameMode)
                    .orElse(0.0);
            result.put("bestCps", bestCps);
        }

        return result;
    }

    /**
     * 获取用户的历史成绩
     */
    public List<GameScore> getHistory(Long userId, Integer gameMode) {
        return gameScoreRepository.findTop10ByUserIdAndGameModeOrderByCreatedAtDesc(userId, gameMode);
    }
}
