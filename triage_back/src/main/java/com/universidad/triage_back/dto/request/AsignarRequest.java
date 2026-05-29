package com.universidad.triage_back.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class AsignarRequest {
    @NotNull private Long responsableId;
}
