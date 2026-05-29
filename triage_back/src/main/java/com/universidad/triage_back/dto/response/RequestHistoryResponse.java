package com.universidad.triage_back.dto.response;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RequestHistoryResponse {
    private Long id;
    private LocalDateTime actionDate;
    private String action;
    private String observations;
    private UserResponse user;
}
