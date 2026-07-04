package com.budget.predict.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LlmClientService {

    @Value("${groq.api.key:}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public LlmClientService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = new ObjectMapper();
    }

    public Flux<String> streamCompletion(String prompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            return Flux.just("Error: groq.api.key is not configured in application.properties.");
        }

        String url = "https://api.groq.com/openai/v1/chat/completions";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama3-8b-8192");
        requestBody.put("stream", true);
        
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);
        
        requestBody.put("messages", List.of(message));

        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractTextFromChunk)
                .filter(text -> !text.isEmpty());
    }

    private String extractTextFromChunk(String chunk) {
        try {
            if (chunk.startsWith("data: ")) {
                chunk = chunk.substring(6).trim();
            }
            if (chunk.equals("[DONE]")) {
                return "";
            }
            JsonNode root = objectMapper.readTree(chunk);
            if (root != null && root.has("choices")) {
                JsonNode choices = root.get("choices");
                if (choices.isArray() && choices.size() > 0) {
                    JsonNode delta = choices.get(0).get("delta");
                    if (delta != null && delta.has("content")) {
                        return delta.get("content").asText();
                    }
                }
            }
        } catch (Exception e) {
            // Ignore parse errors for malformed chunks
        }
        return "";
    }
}
