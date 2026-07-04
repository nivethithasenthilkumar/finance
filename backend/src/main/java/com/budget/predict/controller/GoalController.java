package com.budget.predict.controller;

import com.budget.predict.model.Goal;
import com.budget.predict.model.User;
import com.budget.predict.repository.GoalRepository;
import com.budget.predict.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    @Autowired private GoalRepository goalRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam String email) {
        Optional<User> user = userRepo.findByEmail(email);
        if (user.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(goalRepo.findByUser(user.get()));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestParam String email, @RequestBody Goal goal) {
        Optional<User> user = userRepo.findByEmail(email);
        if (user.isEmpty()) return ResponseEntity.notFound().build();
        goal.setUser(user.get());
        return ResponseEntity.ok(goalRepo.save(goal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Goal updated) {
        return goalRepo.findById(id).map(g -> {
            g.setName(updated.getName());
            g.setCategory(updated.getCategory());
            g.setCurrent(updated.getCurrent());
            g.setTarget(updated.getTarget());
            g.setExpected(updated.getExpected());
            g.setRingColorHex(updated.getRingColorHex());
            g.setTextColor(updated.getTextColor());
            g.setStatusBg(updated.getStatusBg());
            g.setStatusText(updated.getStatusText());
            g.setStatusLabel(updated.getStatusLabel());
            return ResponseEntity.ok(goalRepo.save(g));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!goalRepo.existsById(id)) return ResponseEntity.notFound().build();
        goalRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── Contribute to goal ──
    @PatchMapping("/{id}/contribute")
    public ResponseEntity<?> contribute(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        double amount = ((Number) body.get("amount")).doubleValue();
        return goalRepo.findById(id).map(g -> {
            g.setCurrent(Math.max(0, g.getCurrent() + amount));
            g.setStatusLabel(g.getCurrent() / g.getTarget() >= 0.3 ? "On Track" : "Behind");
            return ResponseEntity.ok(goalRepo.save(g));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulk(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        goalRepo.deleteByUser(userOpt.get());
        return ResponseEntity.ok().build();
    }
}
