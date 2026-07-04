package com.budget.predict.controller;

import com.budget.predict.model.AiChat;
import com.budget.predict.model.User;
import com.budget.predict.repository.AiChatRepository;
import com.budget.predict.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import com.budget.predict.dto.AiContextDTO;
import com.budget.predict.dto.ChatRequest;
import com.budget.predict.dto.PageSnapshotDTO;
import com.budget.predict.service.AiContextService;
import com.budget.predict.service.LlmClientService;
import com.budget.predict.service.PageContextService;
import com.budget.predict.service.PromptBuilderService;
import reactor.core.publisher.Flux;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AiChatController {

    @Autowired private AiChatRepository chatRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private AiContextService aiContextService;
    @Autowired private PageContextService pageContextService;
    @Autowired private PromptBuilderService promptBuilderService;
    @Autowired private LlmClientService llmClientService;

    // ── Get all chats for a user ──
    @GetMapping("/chats")
    public ResponseEntity<?> getAll(@RequestParam(required = false) String email) {
        if (email != null && !email.isEmpty()) {
            Optional<User> user = userRepo.findByEmail(email);
            if (user.isPresent()) {
                return ResponseEntity.ok(chatRepo.findByUserIdOrderByTimestampAsc(user.get().getId()));
            }
        }
        return ResponseEntity.ok(chatRepo.findAllByOrderByTimestampAsc());
    }

    // ── Old fallback Create ──
    @PostMapping("/chats")
    public ResponseEntity<?> create(@RequestParam(required = false) String email, @RequestBody AiChat chat) {
        if (email != null && !email.isEmpty()) {
            Optional<User> userOpt = userRepo.findByEmail(email);
            userOpt.ifPresent(chat::setUser);
        }
        return ResponseEntity.ok(chatRepo.save(chat));
    }

    // ── Delete chat entry ──
    @DeleteMapping("/chats/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!chatRepo.existsById(id)) return ResponseEntity.notFound().build();
        chatRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── New Streaming Chat Endpoint ──
    @PostMapping(value = "/ai/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@RequestBody ChatRequest req) {
        Optional<User> userOpt = userRepo.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            return Flux.just("User not found.");
        }
        User user = userOpt.get();
        Long userId = user.getId();

        AiContextDTO globalContext = aiContextService.getOrBuildContext(userId);
        PageSnapshotDTO pageSnapshot = pageContextService.buildPageSnapshot(userId, req.getCurrentPage());
        List<AiChat> recentHistory = chatRepo.findByUserIdOrderByTimestampAsc(userId);
        
        // Keep only last 8
        if (recentHistory.size() > 8) {
            recentHistory = recentHistory.subList(recentHistory.size() - 8, recentHistory.size());
        }

        String prompt = promptBuilderService.buildPrompt(req.getMessage(), globalContext, pageSnapshot, req.getCurrentPage(), recentHistory);
        
        return llmClientService.streamCompletion(prompt)
                .doOnComplete(() -> {
                    // Stream completed
                });
    }
}
