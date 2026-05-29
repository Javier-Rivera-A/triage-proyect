package com.universidad.triage_back.service;
import com.universidad.triage_back.dto.request.*;
import com.universidad.triage_back.dto.response.AcademicRequestResponse;
import com.universidad.triage_back.enums.Priority;
import com.universidad.triage_back.enums.RequestType;
import com.universidad.triage_back.enums.Status;
import java.util.List;
public interface AcademicRequestService {
    AcademicRequestResponse createRequest(CreateRequestBody body, Long authenticatedUserId);
    List<AcademicRequestResponse> listAllRequests(Status status, RequestType type, Priority priority, Long responsibleId);
    List<AcademicRequestResponse> misSolicitudes(Long userId);
    AcademicRequestResponse getRequestById(Long id);
    void deleteRequest(Long id);
    AcademicRequestResponse changeStatus(Long id, ChangeStatusRequest request, Long actorUserId);
    AcademicRequestResponse assignResponsible(Long id, AssignResponsibleRequest request, Long actorUserId);
    AcademicRequestResponse setPriority(Long id, SetPriorityRequest request, Long actorUserId);
    AcademicRequestResponse clasificar(Long id, ClasificarRequest dto, Long actorUserId);
    AcademicRequestResponse asignar(Long id, AsignarRequest dto, Long actorUserId);
    AcademicRequestResponse atender(Long id, AccionObservacionRequest dto, Long actorUserId);
    AcademicRequestResponse cerrar(Long id, AccionObservacionRequest dto, Long actorUserId);
    AcademicRequestResponse reabrir(Long id, AccionObservacionRequest dto, Long actorUserId);
}
