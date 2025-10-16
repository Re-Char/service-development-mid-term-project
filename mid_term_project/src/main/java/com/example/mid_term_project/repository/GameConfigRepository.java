package com.example.mid_term_project.repository;

import com.example.mid_term_project.entity.GameConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameConfigRepository extends JpaRepository<GameConfig, Long> {

    Optional<GameConfig> findByUserId(Long userId);
}
