package com.budget.predict.repository;

import com.budget.predict.model.Budget;
import com.budget.predict.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    void deleteByUser(User user);
}
