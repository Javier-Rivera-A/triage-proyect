package com.universidad.triage_back.service;
import com.universidad.triage_back.dto.request.CreateUserRequest;
import com.universidad.triage_back.dto.request.UpdateUserRequest;
import com.universidad.triage_back.dto.response.UserResponse;
import java.util.List;
public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    List<UserResponse> listAllUsers();
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void deleteUser(Long id);
}
