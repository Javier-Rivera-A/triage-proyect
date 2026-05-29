package com.universidad.triage_back.service.impl;

import com.universidad.triage_back.dto.request.CreateHistoryRequest;
import com.universidad.triage_back.dto.response.RequestHistoryResponse;
import com.universidad.triage_back.dto.response.UserResponse;
import com.universidad.triage_back.entity.AcademicRequest;
import com.universidad.triage_back.entity.RequestHistory;
import com.universidad.triage_back.entity.User;
import com.universidad.triage_back.exception.ResourceNotFoundException;
import com.universidad.triage_back.repository.AcademicRequestRepository;
import com.universidad.triage_back.repository.RequestHistoryRepository;
import com.universidad.triage_back.repository.UserRepository;
import com.universidad.triage_back.service.RequestHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestHistoryServiceImpl implements RequestHistoryService {

    private final RequestHistoryRepository historyRepository;
    private final AcademicRequestRepository requestRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RequestHistoryResponse> getHistoryByRequestId(Long requestId) {
        if (!requestRepository.existsById(requestId)) {
            throw new ResourceNotFoundException("Solicitud", requestId);
        }
        return historyRepository.findByRequestIdOrderByActionDateAsc(requestId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public RequestHistoryResponse createHistoryEntry(Long requestId, CreateHistoryRequest body) {
        AcademicRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", requestId));
        User user = userRepository.findById(body.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", body.getUserId()));
        RequestHistory entry = RequestHistory.builder()
                .request(request).action(body.getAction())
                .observations(body.getObservations()).user(user).build();
        return toResponse(historyRepository.save(entry));
    }

    private RequestHistoryResponse toResponse(RequestHistory h) {
        User u = h.getUser();
        return RequestHistoryResponse.builder()
                .id(h.getId()).actionDate(h.getActionDate())
                .action(h.getAction()).observations(h.getObservations())
                .user(UserResponse.builder()
                        .id(u.getId()).name(u.getName())
                        .email(u.getEmail()).role(u.getRole())
                        .active(u.isActive()).build())
                .build();
    }
}
