package com.universidad.triage_back.dto.request;
import com.universidad.triage_back.enums.Priority;
import com.universidad.triage_back.enums.RequestType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class ClasificarRequest {
    private RequestType tipo;
    @NotNull private Priority prioridad;
    private String justificacion;
}
