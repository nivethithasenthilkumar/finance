package com.budget.predict.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AiContextDTO {
    private Double currentBalance;
    private Double monthlyIncome;
    private Double monthlyExpenses;
    private Double netCashFlow;
    
    private List<BudgetSnapshot> budgets;
    private List<String> overBudgetCategories;
    
    private Double totalSpentThisMonth;
    private Double totalSpentLastMonth;
    
    private List<CategoryAmount> topCategoriesThisMonth;
    private List<TransactionSnapshot> recentTransactions;
    
    private List<GoalSnapshot> goals;
    
    @Data
    public static class BudgetSnapshot {
        private String category;
        private Double budgeted;
        private Double spent;
        private Double remaining;
    }
    
    @Data
    public static class CategoryAmount {
        private String category;
        private Double amount;
    }
    
    @Data
    public static class TransactionSnapshot {
        private String description;
        private Double amount;
        private String type;
        private String date;
        private String category;
    }
    
    @Data
    public static class GoalSnapshot {
        private String name;
        private Double target;
        private Double saved;
    }
}
