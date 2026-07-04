package com.budget.predict.controller;

import com.budget.predict.model.User;
import com.budget.predict.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ── Update full profile ──
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User request) {
        Optional<User> opt = userRepository.findByEmail(request.getEmail());
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        if (request.getName()     != null) user.setName(request.getName());
        if (request.getPhone()    != null) user.setPhone(request.getPhone());
        if (request.getCurrency() != null) user.setCurrency(request.getCurrency());
        if (request.getLanguage() != null) user.setLanguage(request.getLanguage());
        if (request.getPlan()     != null) user.setPlan(request.getPlan());
        return ResponseEntity.ok(userRepository.save(user));
    }

    // ── Toggle camera access ──
    @PatchMapping("/camera-access")
    public ResponseEntity<?> updateCameraAccess(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        Boolean cameraAccess = (Boolean) body.get("cameraAccess");
        if (email == null || cameraAccess == null) {
            return ResponseEntity.badRequest().body("email and cameraAccess are required");
        }
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        user.setCameraAccess(cameraAccess);
        return ResponseEntity.ok(userRepository.save(user));
    }

    // ── Get profile by email ──
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        return userRepository.findByEmail(email)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
