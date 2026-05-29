package com.universidad.triage_back.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class AccionObservacionRequest {
    @NotBlank private String observacion;
}
