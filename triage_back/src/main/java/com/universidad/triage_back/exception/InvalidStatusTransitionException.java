package com.universidad.triage_back.exception;
import com.universidad.triage_back.enums.Status;
public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(Status current, Status next) {
        super("Transición de estado inválida: " + current + " → " + next);
    }
}
