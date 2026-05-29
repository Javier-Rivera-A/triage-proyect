package com.universidad.triage_back.service;

import com.universidad.triage_back.enums.Priority;
import com.universidad.triage_back.enums.RequestType;
import org.springframework.stereotype.Component;

@Component
public class PriorityRulesEngine {

    public Priority suggestPriority(RequestType type) {
        return switch (type) {
            case REGISTRO_ASIGNATURA, CANCELACION_ASIGNATURA -> Priority.P1_CRITICA;
            case HOMOLOGACION, SOLICITUD_CUPO, CORRECCION_NOTA -> Priority.P2_ALTA;
            case CONSULTA_ACADEMICA, CERTIFICADO_CONSTANCIA  -> Priority.P3_MEDIA;
        };
    }

    public String justifyPriority(RequestType type, Priority priority) {
        return switch (type) {
            case REGISTRO_ASIGNATURA    -> "Prioridad crítica: impacta directamente la carga académica.";
            case CANCELACION_ASIGNATURA -> "Prioridad crítica: afecta el crédito académico del estudiante.";
            case HOMOLOGACION           -> "Prioridad alta: tiene fechas límite institucionales.";
            case SOLICITUD_CUPO         -> "Prioridad alta: depende de disponibilidad y periodo de matrícula.";
            case CORRECCION_NOTA        -> "Prioridad alta: afecta el promedio académico del estudiante.";
            case CONSULTA_ACADEMICA     -> "Prioridad media: consulta informativa sin urgencia crítica.";
            case CERTIFICADO_CONSTANCIA -> "Prioridad media: trámite administrativo con tiempo de respuesta estándar.";
        };
    }
}
