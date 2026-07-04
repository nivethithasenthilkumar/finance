package com.budget.predict.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String description;
    private String subtitle;
    private String category;
    private String account;
    private String accountNum;
    private double amount;
    private String type;        // "income" | "expense"
    private String icon;
    private boolean recurring;
    private String status;      // "Completed" | "Pending" | "Failed"
    private LocalDate date;
}
