package com.universidad.triage_back.service.impl;

import com.universidad.triage_back.dto.request.*;
import com.universidad.triage_back.dto.response.AcademicRequestResponse;
import com.universidad.triage_back.dto.response.UserResponse;
import com.universidad.triage_back.entity.AcademicRequest;
import com.universidad.triage_back.entity.RequestHistory;
import com.universidad.triage_back.entity.User;
import com.universidad.triage_back.enums.*;
import com.universidad.triage_back.exception.BusinessException;
import com.universidad.triage_back.exception.ResourceNotFoundException;
import com.universidad.triage_back.repository.AcademicRequestRepository;
import com.universidad.triage_back.repository.RequestHistoryRepository;
import com.universidad.triage_back.repository.UserRepository;
import com.universidad.triage_back.service.AcademicRequestService;
import com.universidad.triage_back.service.PriorityRulesEngine;
import com.universidad.triage_back.service.StatusTransitionValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicRequestServiceImpl implements AcademicRequestService {

    private final AcademicRequestRepository requestRepository;
    private final RequestHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final StatusTransitionValidator statusValidator;
    private final PriorityRulesEngine priorityEngine;

    @Override
    @Transactional
    public AcademicRequestResponse createRequest(CreateRequestBody body, Long authenticatedUserId) {
        User applicant = findUserOrThrow(authenticatedUserId);

        // Si el body trae applicantId y el usuario es ADMIN, se permite crear en nombre de otro
        if (body.getApplicantId() != null
                && !body.getApplicantId().equals(authenticatedUserId)
                && applicant.getRole() == Role.ADMINISTRADOR) {
            applicant = findUserOrThrow(body.getApplicantId());
        }

        Priority suggestedPriority = priorityEngine.suggestPriority(body.getType());
        String justification = priorityEngine.justifyPriority(body.getType(), suggestedPriority);

        AcademicRequest request = AcademicRequest.builder()
                .description(body.getDescription())
                .type(body.getType())
                .originChannel(body.getOriginChannel())
                .status(Status.REGISTRADA)
                .priority(suggestedPriority)
                .priorityJustification(justification)
                .applicant(applicant)
                .history(new ArrayList<>())
                .build();

        AcademicRequest saved = requestRepository.save(request);
        addHistory(saved, "Solicitud registrada en el sistema", null, applicant);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicRequestResponse> listAllRequests(Status status, RequestType type,
                                                          Priority priority, Long responsibleId) {
        boolean hasStatus      = status       != null;
        boolean hasType        = type         != null;
        boolean hasPriority    = priority     != null;
        if (!hasStatus && !hasType && !hasPriority && responsibleId == null) {
            return requestRepository.findAllWithUsers().stream().map(this::toResponse).toList();
        }
        return requestRepository.findWithFilters(
                status,   hasStatus,
                type,     hasType,
                priority, hasPriority,
                responsibleId
        ).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicRequestResponse getRequestById(Long id) {
        return toResponse(findRequestOrThrow(id));
    }

    @Override
    @Transactional
    public void deleteRequest(Long id) {
        AcademicRequest request = findRequestOrThrow(id);
        if (request.getStatus() == Status.CERRADA) {
            throw new BusinessException("Una solicitud cerrada no puede ser eliminada.");
        }
        requestRepository.delete(request);
    }

    @Override
    @Transactional
    public AcademicRequestResponse changeStatus(Long id, ChangeStatusRequest body, Long actorUserId) {
        AcademicRequest request = findRequestOrThrow(id);
        User actor = findUserOrThrow(actorUserId);

        if (request.getStatus() == Status.CERRADA) {
            throw new BusinessException("Una solicitud cerrada no puede ser modificada.");
        }

        statusValidator.validate(request.getStatus(), body.getNewStatus());

        if (body.getNewStatus() == Status.CERRADA
                && (body.getObservation() == null || body.getObservation().isBlank())) {
            throw new BusinessException("Se requiere una observación de cierre.");
        }

        Status previous = request.getStatus();
        request.setStatus(body.getNewStatus());

        if (body.getNewStatus() == Status.CLASIFICADA && request.getPriority() == null) {
            request.setPriority(priorityEngine.suggestPriority(request.getType()));
            request.setPriorityJustification(
                    priorityEngine.justifyPriority(request.getType(), request.getPriority()));
        }

        requestRepository.save(request);
        addHistory(request, "Estado cambiado de " + previous + " a " + body.getNewStatus(),
                body.getObservation(), actor);
        return toResponse(request);
    }

    @Override
    @Transactional
    public AcademicRequestResponse assignResponsible(Long id, AssignResponsibleRequest body, Long actorUserId) {
        AcademicRequest request = findRequestOrThrow(id);
        User actor = findUserOrThrow(actorUserId);

        if (request.getStatus() == Status.CERRADA) {
            throw new BusinessException("No se puede asignar responsable a una solicitud cerrada.");
        }

        User responsible = userRepository.findById(body.getResponsibleId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario responsable", body.getResponsibleId()));

        if (!responsible.isActive()) {
            throw new BusinessException("El usuario asignado no está activo.");
        }
        if (responsible.getRole() != Role.RESPONSABLE && responsible.getRole() != Role.ADMINISTRADOR) {
            throw new BusinessException("El usuario no tiene rol de responsable.");
        }

        request.setResponsible(responsible);
        requestRepository.save(request);
        addHistory(request, "Responsable asignado: " + responsible.getName(), null, actor);
        return toResponse(request);
    }

    @Override
    @Transactional
    public AcademicRequestResponse setPriority(Long id, SetPriorityRequest body, Long actorUserId) {
        AcademicRequest request = findRequestOrThrow(id);
        User actor = findUserOrThrow(actorUserId);

        if (request.getStatus() == Status.CERRADA) {
            throw new BusinessException("No se puede modificar la prioridad de una solicitud cerrada.");
        }

        request.setPriority(body.getPriority());
        request.setPriorityJustification(
                body.getJustification() != null && !body.getJustification().isBlank()
                        ? body.getJustification()
                        : priorityEngine.justifyPriority(request.getType(), body.getPriority()));
        requestRepository.save(request);
        addHistory(request, "Prioridad establecida a: " + body.getPriority(), body.getJustification(), actor);
        return toResponse(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicRequestResponse> misSolicitudes(Long userId) {
        return requestRepository.findByApplicantId(userId).stream()
                .map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public AcademicRequestResponse clasificar(Long id, ClasificarRequest dto, Long actorUserId) {
        AcademicRequest request = findRequestOrThrow(id);
        User actor = findUserOrThrow(actorUserId);
        if (request.getStatus() == Status.CERRADA)
            throw new BusinessException("Una solicitud cerrada no puede ser modificada.");
        statusValidator.validate(request.getStatus(), Status.CLASIFICADA);
        if (dto.getTipo() != null) request.setType(dto.getTipo());
        request.setPriority(dto.getPrioridad());
        request.setPriorityJustification(
                dto.getJustificacion() != null && !dto.getJustificacion().isBlank()
                        ? dto.getJustificacion()
                        : priorityEngine.justifyPriority(request.getType(), dto.getPrioridad()));
        request.setStatus(Status.CLASIFICADA);
        requestRepository.save(request);
        addHistory(request, "Solicitud clasificada con prioridad " + dto.getPrioridad(),
                dto.getJustificacion(), actor);
        return toResponse(request);
    }

    @Override
    @Transactional
    public AcademicRequestResponse asignar(Long id, AsignarRequest dto, Long actorUserId) {
        AcademicRequest request = findRequestOrThrow(id);
        User actor = findUserOrThrow(actorUserId);
        if (request.getStatus() == Status.CERRADA)
            throw new BusinessException("Una solicitud cerrada no puede ser modificada.");
        User responsable = userRepository.findById(dto.getResponsableId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario responsable", dto.getResponsableId()));
        if (!responsable.isActive()) throw new BusinessException("El usuario asignado no está activo.");
        if (responsable.getRole() != Role.RESPONSABLE && responsable.getRole() != Role.ADMINISTRADOR)
            throw new BusinessException("El usuario no tiene rol de responsable.");
        statusValidator.validate(request.getStatus(), Status.EN_ATENCION);
        request.setResponsible(responsable);
        request.setStatus(Status.EN_ATENCION);
        requestRepository.save(request);
        addHistory(request, "Responsable asignado: " + responsable.getName(), null, actor);
        return toResponse(request);
    }

    @Override
    @Transactional
    public AcademicRequestResponse atender(Long id, AccionObservacionRequest dto, Long actorUserId) {
        AcademicRequest request = findRequestOrThrow(id);
        User actor = findUserOrThrow(actorUserId);
        if (request.getStatus() == Status.CERRADA)
            throw new BusinessException("Una solicitud cerrada no puede ser modificada.");
        statusValidator.validate(request.getStatus(), Status.ATENDIDA);
        request.setStatus(Status.ATENDIDA);
        requestRepository.save(request);
        addHistory(request, "Solicitud marcada como atendida", dto.getObservacion(), actor);
        return toResponse(request);
    }

    @Override
    @Transactional
    public AcademicRequestResponse cerrar(Long id, AccionObservacionRequest dto, Long actorUserId) {
        AcademicRequest request = findRequestOrThrow(id);
        User actor = findUserOrThrow(actorUserId);
        if (request.getStatus() == Status.CERRADA)
            throw new BusinessException("La solicitud ya está cerrada.");
        statusValidator.validate(request.getStatus(), Status.CERRADA);
        request.setStatus(Status.CERRADA);
        requestRepository.save(request);
        addHistory(request, "Solicitud cerrada", dto.getObservacion(), actor);
        return toResponse(request);
    }

    @Override
    @Transactional
    public AcademicRequestResponse reabrir(Long id, AccionObservacionRequest dto, Long actorUserId) {
        AcademicRequest request = findRequestOrThrow(id);
        User actor = findUserOrThrow(actorUserId);
        if (request.getStatus() == Status.CERRADA)
            throw new BusinessException("Una solicitud cerrada no puede ser reabierta.");
        request.setStatus(Status.EN_ATENCION);
        requestRepository.save(request);
        addHistory(request, "Solicitud reabierta a EN_ATENCION", dto.getObservacion(), actor);
        return toResponse(request);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void addHistory(AcademicRequest request, String action, String observations, User actor) {
        historyRepository.save(RequestHistory.builder()
                .request(request).action(action)
                .observations(observations).user(actor).build());
    }

    private AcademicRequest findRequestOrThrow(Long id) {
        return requestRepository.findByIdWithUsers(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", id));
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
    }

    private AcademicRequestResponse toResponse(AcademicRequest r) {
        return AcademicRequestResponse.builder()
                .id(r.getId()).description(r.getDescription())
                .type(r.getType()).originChannel(r.getOriginChannel())
                .status(r.getStatus()).priority(r.getPriority())
                .priorityJustification(r.getPriorityJustification())
                .registrationDate(r.getRegistrationDate())
                .applicant(userToResponse(r.getApplicant()))
                .responsible(r.getResponsible() != null ? userToResponse(r.getResponsible()) : null)
                .build();
    }

    private UserResponse userToResponse(User u) {
        if (u == null) return null;
        return UserResponse.builder()
                .id(u.getId()).name(u.getName())
                .email(u.getEmail()).role(u.getRole())
                .active(u.isActive()).build();
    }
}
