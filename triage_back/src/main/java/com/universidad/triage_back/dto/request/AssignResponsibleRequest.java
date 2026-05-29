package com.universidad.triage_back.dto.request;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class AssignResponsibleRequest {
    @NotNull private Long responsibleId;
}
