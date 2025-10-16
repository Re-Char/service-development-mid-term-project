package com.example.mid_term_project.repository;

import com.example.mid_term_project.entity.GameScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameScoreRepository extends JpaRepository<GameScore, Long> {

    // 获取用户在指定模式下的最佳成绩
    @Query("SELECT MAX(g.score) FROM GameScore g WHERE g.userId = ?1 AND g.gameMode = ?2")
    Optional<Integer> findBestScoreByUserIdAndGameMode(Long userId, Integer gameMode);

    // 获取用户在指定模式下的最佳 CPS
    @Query("SELECT MAX(g.cps) FROM GameScore g WHERE g.userId = ?1 AND g.gameMode = ?2")
    Optional<Double> findBestCpsByUserIdAndGameMode(Long userId, Integer gameMode);

    // 获取用户在指定模式下的历史成绩（最近10条）
    List<GameScore> findTop10ByUserIdAndGameModeOrderByCreatedAtDesc(Long userId, Integer gameMode);
}
