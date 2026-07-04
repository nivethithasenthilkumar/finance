package com.budget.predict.repository;

import com.budget.predict.model.Goal;
import com.budget.predict.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUser(User user);
    void deleteByUser(User user);
}
