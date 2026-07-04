package com.budget.predict.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "budgets")
@Data
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;
    private String category;
    private double budgetLimit;   // total budget ceiling
    private String barColor;
    private String iconBg;
    private String iconColor;
}
