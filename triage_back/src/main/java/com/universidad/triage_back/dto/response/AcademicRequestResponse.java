package com.universidad.triage_back.dto.response;
import com.universidad.triage_back.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AcademicRequestResponse {
    private Long id;
    private String description;
    private RequestType type;
    private OriginChannel originChannel;
    private Status status;
    private Priority priority;
    private String priorityJustification;
    private LocalDateTime registrationDate;
    private UserResponse applicant;
    private UserResponse responsible;
}
