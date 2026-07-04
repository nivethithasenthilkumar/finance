package com.budget.predict.service;

import com.budget.predict.dto.AiContextDTO;
import com.budget.predict.dto.PageSnapshotDTO;
import com.budget.predict.model.AiChat;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PromptBuilderService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String buildPrompt(String userMessage, AiContextDTO globalContext, PageSnapshotDTO pageSnapshot, String currentPage, List<AiChat> chatHistory) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are the financial assistant inside Budget Predict AI.\n");
        prompt.append("Below is the user's full financial context, plus a snapshot of exactly what they are currently viewing on the \"")
              .append(currentPage != null ? currentPage : "None")
              .append("\" page.\n");
        prompt.append("If the user's question relates to what's on screen, prioritize the page snapshot for exact figures since it reflects what they see right now. Answer using only this data. If a section is missing or empty, say so plainly instead of guessing or inventing numbers.\n");
        prompt.append("Never provide specific investment buy/sell recommendations — only general portfolio observations such as concentration or diversification. Keep responses concise and reference specific numbers from the data provided.\n\n");
        
        prompt.append("[GLOBAL CONTEXT]\n");
        try {
            prompt.append(objectMapper.writeValueAsString(globalContext)).append("\n\n");
        } catch (JsonProcessingException e) {
            prompt.append("{ \"error\": \"Failed to serialize context\" }\n\n");
        }

        prompt.append("[CURRENT PAGE: ").append(currentPage != null ? currentPage : "None").append("]\n");
        prompt.append("[PAGE SNAPSHOT]\n");
        try {
            if (pageSnapshot != null && pageSnapshot.getSnapshotData() != null) {
                prompt.append(objectMapper.writeValueAsString(pageSnapshot.getSnapshotData())).append("\n\n");
            } else {
                prompt.append("N/A — no financial data on this page\n\n");
            }
        } catch (JsonProcessingException e) {
            prompt.append("N/A — failed to serialize page data\n\n");
        }

        prompt.append("[RECENT CONVERSATION]\n");
        if (chatHistory != null && !chatHistory.isEmpty()) {
            for (AiChat chat : chatHistory) {
                if (chat.getUserMessage() != null) {
                    prompt.append("User: ").append(chat.getUserMessage()).append("\n");
                }
                if (chat.getAiResponse() != null) {
                    prompt.append("AI: ").append(chat.getAiResponse()).append("\n");
                }
            }
        } else {
            prompt.append("No recent conversation.\n");
        }
        prompt.append("\n");

        prompt.append("[USER MESSAGE]\n");
        prompt.append(userMessage).append("\n");

        return prompt.toString();
    }
}
