package com.budget.predict.repository;

import com.budget.predict.model.AiChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatRepository extends JpaRepository<AiChat, Long> {
    List<AiChat> findByUserIdOrderByTimestampAsc(Long userId);
    List<AiChat> findAllByOrderByTimestampAsc();
}
