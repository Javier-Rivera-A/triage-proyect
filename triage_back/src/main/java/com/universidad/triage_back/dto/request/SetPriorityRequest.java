package com.universidad.triage_back.dto.request;
import com.universidad.triage_back.enums.Priority;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class SetPriorityRequest {
    @NotNull private Priority priority;
    private String justification;
}
