package com.budget.predict.repository;

import com.budget.predict.model.Transaction;
import com.budget.predict.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByDateDesc(User user);
    void deleteByUser(User user);
}
