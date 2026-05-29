package com.universidad.triage_back.config;

import com.universidad.triage_back.entity.AcademicRequest;
import com.universidad.triage_back.entity.RequestHistory;
import com.universidad.triage_back.entity.User;
import com.universidad.triage_back.enums.*;
import com.universidad.triage_back.repository.AcademicRequestRepository;
import com.universidad.triage_back.repository.RequestHistoryRepository;
import com.universidad.triage_back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AcademicRequestRepository requestRepository;
    private final RequestHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // ── Usuarios ──────────────────────────────────────────────────────────
        User admin = userRepository.save(User.builder()
                .name("Administrador").email("admin@universidad.edu.co")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMINISTRADOR).active(true).build());

        User operador = userRepository.save(User.builder()
                .name("Carlos Operador").email("operador@universidad.edu.co")
                .password(passwordEncoder.encode("oper123"))
                .role(Role.OPERADOR).active(true).build());

        User resp = userRepository.save(User.builder()
                .name("María Pérez").email("responsable@universidad.edu.co")
                .password(passwordEncoder.encode("resp123"))
                .role(Role.RESPONSABLE).active(true).build());

        User est1 = userRepository.save(User.builder()
                .name("Juan García").email("estudiante@universidad.edu.co")
                .password(passwordEncoder.encode("est123"))
                .role(Role.ESTUDIANTE).active(true).build());

        User est2 = userRepository.save(User.builder()
                .name("Laura Martínez").email("laura.martinez@universidad.edu.co")
                .password(passwordEncoder.encode("est123"))
                .role(Role.ESTUDIANTE).active(true).build());

        User est3 = userRepository.save(User.builder()
                .name("Carlos Díaz").email("carlos.diaz@universidad.edu.co")
                .password(passwordEncoder.encode("est123"))
                .role(Role.ESTUDIANTE).active(true).build());

        log.info("Usuarios de prueba creados: admin / operador / responsable / 3 estudiantes");

        // ── Mock Solicitudes ──────────────────────────────────────────────────
        createRequest("Solicitud de homologación de la asignatura Cálculo Diferencial cursada en la Universidad Nacional, " +
                "por considerar que los contenidos son equivalentes al 95% del programa.",
                RequestType.HOMOLOGACION, OriginChannel.CSU,
                Status.CLASIFICADA, Priority.P2_ALTA,
                "Homologación: prioridad alta por impacto en avance de carrera",
                est1, resp, admin, LocalDateTime.now().minusDays(12));

        createRequest("Solicitud de cupo adicional en la asignatura Programación Avanzada (grupo 2), " +
                "ya que el grupo asignado presenta conflicto de horario con Redes de Computadores.",
                RequestType.SOLICITUD_CUPO, OriginChannel.EMAIL,
                Status.EN_ATENCION, Priority.P2_ALTA,
                "Cupo urgente: conflicto de horario afecta malla curricular",
                est2, resp, admin, LocalDateTime.now().minusDays(8));

        createRequest("Cancelación de la asignatura Electiva III por motivos de salud debidamente certificados. " +
                "Adjunto historia clínica que respalda la solicitud.",
                RequestType.CANCELACION_ASIGNATURA, OriginChannel.PRESENCIAL,
                Status.ATENDIDA, Priority.P2_ALTA,
                "Cancelación médica: prioridad alta por causa de fuerza mayor",
                est3, resp, admin, LocalDateTime.now().minusDays(20));

        createRequest("Registro extemporáneo de la asignatura Bases de Datos II. " +
                "El sistema no permitió el registro en el período ordinario por un error en mi código de matrícula.",
                RequestType.REGISTRO_ASIGNATURA, OriginChannel.SAC,
                Status.REGISTRADA, Priority.P3_MEDIA,
                "Registro normal: prioridad media",
                est1, null, admin, LocalDateTime.now().minusDays(3));

        createRequest("Consulta sobre los requisitos para solicitar suficiencia en el idioma inglés y " +
                "el proceso para presentar el examen de clasificación del Centro de Idiomas.",
                RequestType.CONSULTA_ACADEMICA, OriginChannel.EMAIL,
                Status.CERRADA, Priority.P4_BAJA,
                "Consulta informativa: prioridad baja",
                est2, resp, resp, LocalDateTime.now().minusDays(30));

        createRequest("Homologación de la asignatura Introducción a la Ingeniería cursada en el SENA " +
                "como técnico en Sistemas. Presento syllabus detallado para evaluación.",
                RequestType.HOMOLOGACION, OriginChannel.TELEFONICO,
                Status.REGISTRADA, Priority.P3_MEDIA,
                "Homologación SENA: evaluación pendiente",
                est3, null, admin, LocalDateTime.now().minusDays(1));

        createRequest("Cancelación de Estadística I por traslape con jornada laboral. Soy estudiante " +
                "trabajador con contrato a tiempo completo, solicito comprensión institucional.",
                RequestType.CANCELACION_ASIGNATURA, OriginChannel.EMAIL,
                Status.CLASIFICADA, Priority.P3_MEDIA,
                "Cancelación laboral: prioridad media",
                est1, resp, admin, LocalDateTime.now().minusDays(6));

        createRequest("Solicitud de cupo en Seminario de Investigación, asignatura electiva con " +
                "capacidad limitada. Solo quedan 2 puestos disponibles según el sistema.",
                RequestType.SOLICITUD_CUPO, OriginChannel.CSU,
                Status.EN_ATENCION, Priority.P2_ALTA,
                "Cupo limitado: urgencia por disponibilidad",
                est2, resp, admin, LocalDateTime.now().minusDays(4));

        createRequest("Corrección de nota en Algoritmos y Estructuras de Datos. La nota registrada " +
                "no corresponde al parcial presentado, tengo evidencia del examen calificado.",
                RequestType.CORRECCION_NOTA, OriginChannel.SAC,
                Status.REGISTRADA, Priority.P2_ALTA,
                "Corrección urgente: discrepancia en acta de notas",
                est3, null, admin, LocalDateTime.now().minusDays(2));

        createRequest("Solicitud de certificado de notas en inglés para aplicar a beca internacional. " +
                "Se requiere con urgencia para cumplir el plazo de postulación.",
                RequestType.CERTIFICADO_CONSTANCIA, OriginChannel.EMAIL,
                Status.CLASIFICADA, Priority.P2_ALTA,
                "Certificado urgente: plazo beca internacional",
                est1, resp, admin, LocalDateTime.now().minusDays(5));

        log.info("Mock data: 10 solicitudes académicas creadas para demo.");
    }

    private void createRequest(String description, RequestType type, OriginChannel channel,
                                Status status, Priority priority, String justification,
                                User applicant, User responsible, User actor,
                                LocalDateTime date) {
        AcademicRequest req = AcademicRequest.builder()
                .description(description).type(type).originChannel(channel)
                .status(status).priority(priority).priorityJustification(justification)
                .applicant(applicant).responsible(responsible)
                .build();
        AcademicRequest saved = requestRepository.save(req);
        saved.setRegistrationDate(date);
        saved = requestRepository.save(saved);

        historyRepository.save(RequestHistory.builder()
                .request(saved).action("Solicitud registrada en el sistema")
                .observations(null).user(applicant).build());

        if (status != Status.REGISTRADA) {
            historyRepository.save(RequestHistory.builder()
                    .request(saved).action("Estado cambiado de REGISTRADA a " + status)
                    .observations(status == Status.CERRADA ? "Solicitud resuelta satisfactoriamente." : null)
                    .user(actor).build());
        }
        if (responsible != null) {
            historyRepository.save(RequestHistory.builder()
                    .request(saved).action("Responsable asignado: " + responsible.getName())
                    .observations(null).user(actor).build());
        }
    }
}
