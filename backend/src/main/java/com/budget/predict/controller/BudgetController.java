package com.budget.predict.controller;

import com.budget.predict.model.Budget;
import com.budget.predict.model.User;
import com.budget.predict.repository.BudgetRepository;
import com.budget.predict.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired private BudgetRepository budgetRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam String email) {
        Optional<User> user = userRepo.findByEmail(email);
        if (user.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(budgetRepo.findByUser(user.get()));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestParam String email, @RequestBody Budget budget) {
        Optional<User> user = userRepo.findByEmail(email);
        if (user.isEmpty()) return ResponseEntity.notFound().build();
        budget.setUser(user.get());
        return ResponseEntity.ok(budgetRepo.save(budget));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Budget updated) {
        return budgetRepo.findById(id).map(b -> {
            b.setName(updated.getName());
            b.setCategory(updated.getCategory());
            b.setBudgetLimit(updated.getBudgetLimit());
            b.setBarColor(updated.getBarColor());
            b.setIconBg(updated.getIconBg());
            b.setIconColor(updated.getIconColor());
            return ResponseEntity.ok(budgetRepo.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!budgetRepo.existsById(id)) return ResponseEntity.notFound().build();
        budgetRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk")
    @Transactional
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> bulk(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        budgetRepo.deleteByUser(user);
        
        List<Map<String, Object>> list = (List<Map<String, Object>>) body.get("budgets");
        if (list != null) {
            for (Map<String, Object> map : list) {
                Budget b = new Budget();
                b.setUser(user);
                b.setName((String) map.get("name"));
                b.setCategory((String) map.get("category"));
                b.setBudgetLimit(map.get("budget") != null ? ((Number) map.get("budget")).doubleValue() : 0.0);
                b.setBarColor((String) map.get("barColor"));
                b.setIconBg((String) map.get("iconBg"));
                b.setIconColor((String) map.get("iconColor"));
                budgetRepo.save(b);
            }
        }
        return ResponseEntity.ok().build();
    }
}
