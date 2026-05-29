package com.universidad.triage_back.service;

import com.universidad.triage_back.enums.Status;
import com.universidad.triage_back.exception.InvalidStatusTransitionException;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class StatusTransitionValidator {

    private static final Map<Status, Set<Status>> ALLOWED = Map.of(
        Status.REGISTRADA,  Set.of(Status.CLASIFICADA),
        Status.CLASIFICADA, Set.of(Status.EN_ATENCION),
        Status.EN_ATENCION, Set.of(Status.ATENDIDA, Status.EN_ATENCION),
        Status.ATENDIDA,    Set.of(Status.CERRADA, Status.EN_ATENCION),
        Status.CERRADA,     Set.of()
    );

    public void validate(Status current, Status next) {
        if (!ALLOWED.getOrDefault(current, Set.of()).contains(next)) {
            throw new InvalidStatusTransitionException(current, next);
        }
    }
}
