package com.universidad.triage_back.dto.request;
import lombok.Data;
@Data
public class UpdateUserRequest {
    private String name;
    private Boolean active;
}
