package com.budget.predict.service;

import com.budget.predict.dto.AiContextDTO;
import com.budget.predict.model.Budget;
import com.budget.predict.model.Goal;
import com.budget.predict.model.Transaction;
import com.budget.predict.model.User;
import com.budget.predict.repository.BudgetRepository;
import com.budget.predict.repository.GoalRepository;
import com.budget.predict.repository.TransactionRepository;
import com.budget.predict.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AiContextService {

    @Autowired private TransactionRepository txRepo;
    @Autowired private BudgetRepository budgetRepo;
    @Autowired private GoalRepository goalRepo;
    @Autowired private UserRepository userRepo;

    @Cacheable(value = "aiContextCache", key = "#userId")
    public AiContextDTO getOrBuildContext(Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return new AiContextDTO(); // Return empty if user not found

        User user = userOpt.get();
        AiContextDTO dto = new AiContextDTO();

        // Transactions
        List<Transaction> transactions = txRepo.findByUserOrderByDateDesc(user);
        
        double income = 0;
        double expense = 0;
        Map<String, Double> categoryTotals = new HashMap<>();

        List<AiContextDTO.TransactionSnapshot> recentTx = new ArrayList<>();
        int count = 0;

        for (Transaction tx : transactions) {
            if (tx.getType().equalsIgnoreCase("income")) {
                income += tx.getAmount();
            } else {
                expense += tx.getAmount();
                categoryTotals.merge(tx.getCategory(), tx.getAmount(), Double::sum);
            }

            if (count < 10) {
                AiContextDTO.TransactionSnapshot snapshot = new AiContextDTO.TransactionSnapshot();
                snapshot.setAmount(tx.getAmount());
                snapshot.setCategory(tx.getCategory());
                snapshot.setDate(tx.getDate() != null ? tx.getDate().toString() : "");
                snapshot.setDescription(tx.getDescription());
                snapshot.setType(tx.getType());
                recentTx.add(snapshot);
                count++;
            }
        }

        dto.setRecentTransactions(recentTx);
        dto.setMonthlyIncome(income);
        dto.setMonthlyExpenses(expense);
        dto.setNetCashFlow(income - expense);
        dto.setCurrentBalance(income - expense); // Simplified

        List<AiContextDTO.CategoryAmount> topCategories = categoryTotals.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(5)
                .map(e -> {
                    AiContextDTO.CategoryAmount cat = new AiContextDTO.CategoryAmount();
                    cat.setCategory(e.getKey());
                    cat.setAmount(e.getValue());
                    return cat;
                })
                .collect(Collectors.toList());
        dto.setTopCategoriesThisMonth(topCategories);

        // Budgets
        List<Budget> budgets = budgetRepo.findByUser(user);
        List<AiContextDTO.BudgetSnapshot> budgetSnapshots = new ArrayList<>();
        List<String> overBudget = new ArrayList<>();

        for (Budget b : budgets) {
            AiContextDTO.BudgetSnapshot bs = new AiContextDTO.BudgetSnapshot();
            bs.setCategory(b.getCategory());
            bs.setBudgeted(b.getBudgetLimit());
            double spent = categoryTotals.getOrDefault(b.getCategory(), 0.0);
            bs.setSpent(spent);
            bs.setRemaining(b.getBudgetLimit() - spent);
            budgetSnapshots.add(bs);

            if (spent > b.getBudgetLimit()) {
                overBudget.add(b.getCategory());
            }
        }
        dto.setBudgets(budgetSnapshots);
        dto.setOverBudgetCategories(overBudget);

        // Goals
        List<Goal> goals = goalRepo.findByUser(user);
        List<AiContextDTO.GoalSnapshot> goalSnapshots = new ArrayList<>();
        for (Goal g : goals) {
            AiContextDTO.GoalSnapshot gs = new AiContextDTO.GoalSnapshot();
            gs.setName(g.getName());
            gs.setSaved(g.getCurrent());
            gs.setTarget(g.getTarget());
            goalSnapshots.add(gs);
        }
        dto.setGoals(goalSnapshots);

        return dto;
    }
}
