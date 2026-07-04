package com.budget.predict.service;

import com.budget.predict.dto.PageSnapshotDTO;
import com.budget.predict.model.User;
import com.budget.predict.repository.BudgetRepository;
import com.budget.predict.repository.GoalRepository;
import com.budget.predict.repository.TransactionRepository;
import com.budget.predict.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PageContextService {

    @Autowired private TransactionRepository txRepo;
    @Autowired private BudgetRepository budgetRepo;
    @Autowired private GoalRepository goalRepo;
    @Autowired private UserRepository userRepo;

    public PageSnapshotDTO buildPageSnapshot(Long userId, String currentPage) {
        PageSnapshotDTO snapshot = new PageSnapshotDTO();
        snapshot.setPageName(currentPage);
        
        if (currentPage == null || currentPage.isEmpty()) {
            snapshot.setSnapshotData("N/A - No specific page provided.");
            return snapshot;
        }

        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            snapshot.setSnapshotData("User not found.");
            return snapshot;
        }
        User user = userOpt.get();

        switch (currentPage.toLowerCase()) {
            case "transactions":
                snapshot.setSnapshotData(txRepo.findByUserOrderByDateDesc(user));
                break;
            case "budget-planner":
            case "budgets":
                snapshot.setSnapshotData(budgetRepo.findByUser(user));
                break;
            case "goals":
                snapshot.setSnapshotData(goalRepo.findByUser(user));
                break;
            case "overview":
            case "dashboard":
                snapshot.setSnapshotData("See Global Context for Overview metrics.");
                break;
            default:
                snapshot.setSnapshotData("N/A - No financial data isolated for this specific page.");
                break;
        }
        return snapshot;
    }
}
