package com.universidad.triage_back.controller;

import com.universidad.triage_back.dto.request.CreateHistoryRequest;
import com.universidad.triage_back.dto.response.RequestHistoryResponse;
import com.universidad.triage_back.service.RequestHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requests/{id}/history")
@RequiredArgsConstructor
public class HistoryController {

    private final RequestHistoryService historyService;

    @GetMapping
    public ResponseEntity<List<RequestHistoryResponse>> getRequestHistory(@PathVariable Long id) {
        return ResponseEntity.ok(historyService.getHistoryByRequestId(id));
    }

    @PostMapping
    public ResponseEntity<RequestHistoryResponse> createHistoryEntry(
            @PathVariable Long id,
            @Valid @RequestBody CreateHistoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(historyService.createHistoryEntry(id, request));
    }
}
