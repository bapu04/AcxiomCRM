package com.fraudgraph.service;

import com.fraudgraph.dto.AuthRequest;
import com.fraudgraph.dto.AuthResponse;
import com.fraudgraph.model.User;
import com.fraudgraph.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String username, String email, String rawPassword, String fullName, String role) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String encodedPassword = passwordEncoder.encode(rawPassword);
        User user = new User(username, email, encodedPassword, fullName, role != null ? role : "ROLE_INVESTIGATOR");
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean validateCredentials(String username, String rawPassword) {
        Optional<User> opt = userRepository.findByUsername(username);
        return opt.isPresent() && passwordEncoder.matches(rawPassword, opt.get().getPassword());
    }
}
