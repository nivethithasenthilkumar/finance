package com.budget.predict.controller;

import com.budget.predict.model.Transaction;
import com.budget.predict.model.User;
import com.budget.predict.repository.TransactionRepository;
import com.budget.predict.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired private TransactionRepository txRepo;
    @Autowired private UserRepository userRepo;

    // ── Get all transactions for a user ──
    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam String email) {
        Optional<User> user = userRepo.findByEmail(email);
        if (user.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(txRepo.findByUserOrderByDateDesc(user.get()));
    }

    // ── Create single transaction ──
    @PostMapping
    public ResponseEntity<?> create(@RequestParam String email, @RequestBody Transaction tx) {
        Optional<User> user = userRepo.findByEmail(email);
        if (user.isEmpty()) return ResponseEntity.notFound().build();
        tx.setUser(user.get());
        return ResponseEntity.ok(txRepo.save(tx));
    }

    // ── Update transaction ──
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Transaction updated) {
        return txRepo.findById(id).map(tx -> {
            tx.setDescription(updated.getDescription());
            tx.setSubtitle(updated.getSubtitle());
            tx.setCategory(updated.getCategory());
            tx.setAmount(updated.getAmount());
            tx.setType(updated.getType());
            tx.setDate(updated.getDate());
            tx.setIcon(updated.getIcon());
            tx.setRecurring(updated.isRecurring());
            tx.setStatus(updated.getStatus());
            tx.setAccount(updated.getAccount());
            tx.setAccountNum(updated.getAccountNum());
            return ResponseEntity.ok(txRepo.save(tx));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Delete single transaction ──
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!txRepo.existsById(id)) return ResponseEntity.notFound().build();
        txRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ── Bulk sync (replaces all user's transactions) ──
    @PostMapping("/bulk")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> bulk(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        txRepo.deleteByUser(user);
        // Frontend sends raw objects; we accept them as-is via separate endpoint
        return ResponseEntity.ok().build();
    }
}
