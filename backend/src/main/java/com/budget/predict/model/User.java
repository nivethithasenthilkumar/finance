package com.budget.predict.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name = "";
    private String email = "";
    private String phone = "";
    private String password = "";
    private String currency = "USD";
    private String language = "English";
    private String plan = "Free";

    @Column(columnDefinition = "TEXT")
    private String avatar = "";

    @Column(name = "camera_access", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean cameraAccess = false;
}
