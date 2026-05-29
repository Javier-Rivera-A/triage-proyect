// =========================================================
// Enumeraciones alineadas con los enums del backend
// =========================================================

/** backend: Status.java */
export type EstadoSolicitud =
  | 'REGISTRADA'
  | 'CLASIFICADA'
  | 'EN_ATENCION'
  | 'ATENDIDA'
  | 'CERRADA';

/** backend: Priority.java */
export type Prioridad = 'P1_CRITICA' | 'P2_ALTA' | 'P3_MEDIA' | 'P4_BAJA';

/** backend: RequestType.java */
export type TipoSolicitud =
  | 'REGISTRO_ASIGNATURA'
  | 'HOMOLOGACION'
  | 'CANCELACION_ASIGNATURA'
  | 'SOLICITUD_CUPO'
  | 'CONSULTA_ACADEMICA'
  | 'CORRECCION_NOTA'
  | 'CERTIFICADO_CONSTANCIA';

/** backend: OriginChannel.java */
export type CanalOrigen =
  | 'CSU'
  | 'EMAIL'
  | 'SAC'
  | 'TELEFONICO'
  | 'PRESENCIAL';

/** backend: Role.java */
export type RolUsuario = 'ESTUDIANTE' | 'OPERADOR' | 'RESPONSABLE' | 'ADMINISTRADOR';

// =========================================================
// Interfaces de entidades
// =========================================================

export interface UsuarioResumen {
  id: number;
  name: string;
  email: string;
  role: RolUsuario;
  active: boolean;
}

/** backend: RequestHistoryResponse */
export interface HistorialAccion {
  id: number;
  actionDate: string;
  action: string;
  observations: string | null;
  user: UsuarioResumen;
}

/** backend: AcademicRequestResponse */
export interface Solicitud {
  id: number;
  description: string;
  type: TipoSolicitud;
  originChannel: CanalOrigen;
  status: EstadoSolicitud;
  priority: Prioridad | null;
  priorityJustification: string | null;
  registrationDate: string;
  applicant: UsuarioResumen;
  responsible: UsuarioResumen | null;
  historial?: HistorialAccion[];
}

// =========================================================
// DTOs de petición (request bodies)
// =========================================================

export interface CreateRequestBody {
  description: string;
  type: TipoSolicitud;
  originChannel: CanalOrigen;
  applicantId?: number;
}

export interface ChangeStatusRequest {
  newStatus: EstadoSolicitud;
  observation?: string;
}

export interface AssignResponsibleRequest {
  responsibleId: number;
}

export interface SetPriorityRequest {
  priority: Prioridad;
  justification?: string;
}

export interface ClasificarRequest {
  tipo?: TipoSolicitud;
  prioridad: Prioridad;
  justificacion?: string;
}

export interface AsignarRequest {
  responsableId: number;
}

export interface AccionObservacionRequest {
  observacion?: string;
}

// =========================================================
// Etiquetas legibles para la UI
// =========================================================

export const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
  REGISTRADA:   'Registrada',
  CLASIFICADA:  'Clasificada',
  EN_ATENCION:  'En Atención',
  ATENDIDA:     'Atendida',
  CERRADA:      'Cerrada',
};

export const TIPO_LABELS: Record<TipoSolicitud, string> = {
  REGISTRO_ASIGNATURA:   'Registro de Asignatura',
  HOMOLOGACION:          'Homologación',
  CANCELACION_ASIGNATURA:'Cancelación de Asignatura',
  SOLICITUD_CUPO:        'Solicitud de Cupo',
  CONSULTA_ACADEMICA:    'Consulta Académica',
  CORRECCION_NOTA:       'Corrección de Nota',
  CERTIFICADO_CONSTANCIA:'Certificado / Constancia',
};

export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  P1_CRITICA: 'P1 – Crítica',
  P2_ALTA:    'P2 – Alta',
  P3_MEDIA:   'P3 – Media',
  P4_BAJA:    'P4 – Baja',
};

export const CANAL_LABELS: Record<CanalOrigen, string> = {
  CSU:        'CSU',
  EMAIL:      'Correo',
  SAC:        'SAC',
  TELEFONICO: 'Telefónico',
  PRESENCIAL: 'Presencial',
};
