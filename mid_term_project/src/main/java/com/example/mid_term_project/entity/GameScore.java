package com.example.mid_term_project.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "game_scores")
public class GameScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer score; // 普通模式：点击数；无尽模式：存储 CPS*100

    @Column(name = "game_mode", nullable = false)
    private Integer gameMode; // 1=普通模式, 2=无尽模式

    @Column
    private Double cps; // CPS 值

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
