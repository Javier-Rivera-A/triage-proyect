package com.universidad.triage_back.dto.request;
import com.universidad.triage_back.enums.OriginChannel;
import com.universidad.triage_back.enums.RequestType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class CreateRequestBody {
    @NotBlank private String description;
    @NotNull private RequestType type;
    @NotNull private OriginChannel originChannel;
    private Long applicantId;
}
