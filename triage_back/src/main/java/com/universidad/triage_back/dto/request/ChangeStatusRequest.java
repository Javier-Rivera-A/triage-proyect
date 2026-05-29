package com.universidad.triage_back.dto.request;
import com.universidad.triage_back.enums.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class ChangeStatusRequest {
    @NotNull private Status newStatus;
    private String observation;
}
