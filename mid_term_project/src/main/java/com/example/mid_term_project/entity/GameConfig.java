package com.example.mid_term_project.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "game_configs")
public class GameConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(length = 10)
    private String keyboard = "dfjk"; // 默认按键配置

    @Column(name = "game_time")
    private Integer gameTime = 20; // 默认游戏时长

    @Column(name = "game_mode")
    private Integer gameMode = 1; // 1=普通模式, 2=无尽模式

    @Column(name = "sound_mode", length = 10)
    private String soundMode = "on"; // on/off

    @Column(length = 100)
    private String title; // 自定义标题

    @Column(length = 200)
    private String message; // 自定义消息

    @Column(name = "image_before", columnDefinition = "LONGTEXT")
    private String imageBefore; // 点击前图片 (base64)

    @Column(name = "image_after", columnDefinition = "LONGTEXT")
    private String imageAfter; // 点击后图片 (base64)
}
