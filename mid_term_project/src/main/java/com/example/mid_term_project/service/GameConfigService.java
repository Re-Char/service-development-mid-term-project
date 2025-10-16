package com.example.mid_term_project.service;

import com.example.mid_term_project.entity.GameConfig;
import com.example.mid_term_project.repository.GameConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GameConfigService {

    @Autowired
    private GameConfigRepository gameConfigRepository;

    /**
     * 获取或创建用户的游戏配置
     */
    public GameConfig getOrCreateConfig(Long userId) {
        return gameConfigRepository.findByUserId(userId)
                .orElseGet(() -> {
                    GameConfig config = new GameConfig();
                    config.setUserId(userId);
                    return gameConfigRepository.save(config);
                });
    }

    /**
     * 保存用户的游戏配置
     */
    public GameConfig saveConfig(Long userId, GameConfig config) {
        GameConfig existingConfig = getOrCreateConfig(userId);
        existingConfig.setUserId(userId);

        if (config.getKeyboard() != null) {
            existingConfig.setKeyboard(config.getKeyboard());
        }
        if (config.getGameTime() != null) {
            existingConfig.setGameTime(config.getGameTime());
        }
        if (config.getGameMode() != null) {
            existingConfig.setGameMode(config.getGameMode());
        }
        if (config.getSoundMode() != null) {
            existingConfig.setSoundMode(config.getSoundMode());
        }
        if (config.getTitle() != null) {
            existingConfig.setTitle(config.getTitle());
        }
        if (config.getMessage() != null) {
            existingConfig.setMessage(config.getMessage());
        }
        if (config.getImageBefore() != null) {
            existingConfig.setImageBefore(config.getImageBefore());
        }
        if (config.getImageAfter() != null) {
            existingConfig.setImageAfter(config.getImageAfter());
        }

        return gameConfigRepository.save(existingConfig);
    }
}
