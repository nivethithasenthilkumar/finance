package com.budget.predict.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "goals")
@Data
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;
    private String category;
    private String ringColorHex;
    private String textColor;
    private String statusBg;
    private String statusText;
    private String statusLabel;   // "On Track" | "Behind"
    private double current;
    private double target;
    private String expected;      // deadline string e.g. "Dec 2025"
}
