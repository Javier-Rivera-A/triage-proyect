package com.universidad.triage_back.service.impl;

import com.universidad.triage_back.dto.request.LoginRequest;
import com.universidad.triage_back.dto.response.AuthResponse;
import com.universidad.triage_back.entity.User;
import com.universidad.triage_back.security.JwtService;
import com.universidad.triage_back.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = (User) auth.getPrincipal();
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token).type("Bearer")
                .userId(user.getId()).name(user.getName())
                .email(user.getEmail()).role(user.getRole())
                .build();
    }
}
