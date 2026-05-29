package com.universidad.triage_back.controller;

import com.universidad.triage_back.dto.request.*;
import com.universidad.triage_back.dto.response.AcademicRequestResponse;
import com.universidad.triage_back.entity.User;
import com.universidad.triage_back.enums.Priority;
import com.universidad.triage_back.enums.RequestType;
import com.universidad.triage_back.enums.Status;
import com.universidad.triage_back.service.AcademicRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
public class RequestController {

    private final AcademicRequestService requestService;

    // RF-01: Registrar — ESTUDIANTE, OPERADOR, ADMINISTRADOR
    @PreAuthorize("hasAnyRole('ESTUDIANTE','OPERADOR','ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<AcademicRequestResponse> createRequest(
            @Valid @RequestBody CreateRequestBody body,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(requestService.createRequest(body, currentUser.getId()));
    }

    // RF-07: Listar — OPERADOR, ADMINISTRADOR
    @PreAuthorize("hasAnyRole('OPERADOR','ADMINISTRADOR')")
    @GetMapping
    public ResponseEntity<List<AcademicRequestResponse>> listAllRequests(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) RequestType type,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long responsibleId) {
        return ResponseEntity.ok(requestService.listAllRequests(status, type, priority, responsibleId));
    }

    // RF-07: Mis solicitudes — ESTUDIANTE (propias)
    @PreAuthorize("hasAnyRole('ESTUDIANTE','OPERADOR','ADMINISTRADOR','RESPONSABLE')")
    @GetMapping("/mis-solicitudes")
    public ResponseEntity<List<AcademicRequestResponse>> misSolicitudes(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.misSolicitudes(currentUser.getId()));
    }

    // RF-07: Obtener por id
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<AcademicRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getRequestById(id));
    }

    // RF-02 + RF-03: Clasificar — OPERADOR, ADMINISTRADOR
    @PreAuthorize("hasAnyRole('OPERADOR','ADMINISTRADOR')")
    @PatchMapping("/{id}/clasificar")
    public ResponseEntity<AcademicRequestResponse> clasificar(
            @PathVariable Long id,
            @Valid @RequestBody ClasificarRequest body,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.clasificar(id, body, currentUser.getId()));
    }

    // RF-05: Asignar responsable — OPERADOR, ADMINISTRADOR
    @PreAuthorize("hasAnyRole('OPERADOR','ADMINISTRADOR')")
    @PatchMapping("/{id}/asignar")
    public ResponseEntity<AcademicRequestResponse> asignar(
            @PathVariable Long id,
            @Valid @RequestBody AsignarRequest body,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.asignar(id, body, currentUser.getId()));
    }

    // RF-04: Marcar atendida — RESPONSABLE, ADMINISTRADOR
    @PreAuthorize("hasAnyRole('RESPONSABLE','ADMINISTRADOR')")
    @PatchMapping("/{id}/atender")
    public ResponseEntity<AcademicRequestResponse> atender(
            @PathVariable Long id,
            @Valid @RequestBody AccionObservacionRequest body,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.atender(id, body, currentUser.getId()));
    }

    // RF-08: Cerrar — solo ADMINISTRADOR
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/cerrar")
    public ResponseEntity<AcademicRequestResponse> cerrar(
            @PathVariable Long id,
            @Valid @RequestBody AccionObservacionRequest body,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.cerrar(id, body, currentUser.getId()));
    }

    // Reabrir — OPERADOR, ADMINISTRADOR
    @PreAuthorize("hasAnyRole('OPERADOR','ADMINISTRADOR')")
    @PatchMapping("/{id}/reabrir")
    public ResponseEntity<AcademicRequestResponse> reabrir(
            @PathVariable Long id,
            @Valid @RequestBody AccionObservacionRequest body,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.reabrir(id, body, currentUser.getId()));
    }

    // Eliminar — ADMINISTRADOR
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        requestService.deleteRequest(id);
        return ResponseEntity.ok().build();
    }

    // Mantener endpoints legacy PUT para compatibilidad
    @PreAuthorize("hasAnyRole('RESPONSABLE','ADMINISTRADOR')")
    @PutMapping("/{id}/status")
    public ResponseEntity<AcademicRequestResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeStatusRequest body,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.changeStatus(id, body, currentUser.getId()));
    }

    @PreAuthorize("hasAnyRole('OPERADOR','ADMINISTRADOR')")
    @PutMapping("/{id}/assign")
    public ResponseEntity<AcademicRequestResponse> assignResponsible(
            @PathVariable Long id,
            @Valid @RequestBody AssignResponsibleRequest body,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.assignResponsible(id, body, currentUser.getId()));
    }

    @PreAuthorize("hasAnyRole('OPERADOR','ADMINISTRADOR')")
    @PutMapping("/{id}/priority")
    public ResponseEntity<AcademicRequestResponse> setPriority(
            @PathVariable Long id,
            @Valid @RequestBody SetPriorityRequest body,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(requestService.setPriority(id, body, currentUser.getId()));
    }
}
