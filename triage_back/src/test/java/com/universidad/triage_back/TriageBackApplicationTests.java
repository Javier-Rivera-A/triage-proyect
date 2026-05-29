package com.universidad.triage_back;

import com.universidad.triage_back.enums.Priority;
import com.universidad.triage_back.enums.RequestType;
import com.universidad.triage_back.enums.Status;
import com.universidad.triage_back.exception.InvalidStatusTransitionException;
import com.universidad.triage_back.service.PriorityRulesEngine;
import com.universidad.triage_back.service.StatusTransitionValidator;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class TriageBackApplicationTests {

    @Test
    void transicionesEstadoValidas() {
        StatusTransitionValidator v = new StatusTransitionValidator();
        assertThatNoException().isThrownBy(() -> v.validate(Status.REGISTRADA,  Status.CLASIFICADA));
        assertThatNoException().isThrownBy(() -> v.validate(Status.CLASIFICADA, Status.EN_ATENCION));
        assertThatNoException().isThrownBy(() -> v.validate(Status.EN_ATENCION, Status.ATENDIDA));
        assertThatNoException().isThrownBy(() -> v.validate(Status.ATENDIDA,    Status.CERRADA));
    }

    @Test
    void transicionInvalidaLanzaExcepcion() {
        StatusTransitionValidator v = new StatusTransitionValidator();
        assertThatThrownBy(() -> v.validate(Status.REGISTRADA, Status.CERRADA))
                .isInstanceOf(InvalidStatusTransitionException.class);
    }

    @Test
    void motorPrioridadCorrecto() {
        PriorityRulesEngine e = new PriorityRulesEngine();
        assertThat(e.suggestPriority(RequestType.REGISTRO_ASIGNATURA)).isEqualTo(Priority.P1_CRITICA);
        assertThat(e.suggestPriority(RequestType.CONSULTA_ACADEMICA)).isEqualTo(Priority.P3_MEDIA);
        assertThat(e.suggestPriority(RequestType.HOMOLOGACION)).isEqualTo(Priority.P2_ALTA);
    }
}
