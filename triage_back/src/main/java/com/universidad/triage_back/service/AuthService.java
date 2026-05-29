package com.universidad.triage_back.service;
import com.universidad.triage_back.dto.request.LoginRequest;
import com.universidad.triage_back.dto.response.AuthResponse;
public interface AuthService {
    AuthResponse login(LoginRequest request);
}
