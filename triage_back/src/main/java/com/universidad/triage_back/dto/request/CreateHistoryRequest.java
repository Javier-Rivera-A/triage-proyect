package com.universidad.triage_back.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class CreateHistoryRequest {
    @NotBlank private String action;
    private String observations;
    @NotNull private Long userId;
}
