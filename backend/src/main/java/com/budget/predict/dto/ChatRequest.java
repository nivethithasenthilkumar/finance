package com.budget.predict.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String email;
    private String message;
    private String currentPage;
}
