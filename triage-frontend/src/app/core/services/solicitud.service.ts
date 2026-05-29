import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Solicitud,
  HistorialAccion,
  CreateRequestBody,
  ChangeStatusRequest,
  AssignResponsibleRequest,
  SetPriorityRequest,
  ClasificarRequest,
  AsignarRequest,
  AccionObservacionRequest,
  EstadoSolicitud,
  TipoSolicitud,
  Prioridad,
} from '../models/solicitud.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private base = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  listar(filtros?: {
    status?: EstadoSolicitud;
    type?: TipoSolicitud;
    priority?: Prioridad;
    responsibleId?: number;
  }): Observable<Solicitud[]> {
    let params = new HttpParams();
    if (filtros?.status)         params = params.set('status',        filtros.status);
    if (filtros?.type)           params = params.set('type',          filtros.type);
    if (filtros?.priority)       params = params.set('priority',      filtros.priority);
    if (filtros?.responsibleId)  params = params.set('responsibleId', filtros.responsibleId);
    return this.http.get<Solicitud[]>(this.base, { params });
  }

  misSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.base}/mis-solicitudes`);
  }

  obtener(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.base}/${id}`);
  }

  obtenerHistorial(id: number): Observable<HistorialAccion[]> {
    return this.http.get<HistorialAccion[]>(`${this.base}/${id}/history`);
  }

  registrar(body: CreateRequestBody): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.base, body);
  }

  // ── Workflow PATCH endpoints ──────────────────────────────────────────────

  clasificar(id: number, body: ClasificarRequest): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.base}/${id}/clasificar`, body);
  }

  asignar(id: number, body: AsignarRequest): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.base}/${id}/asignar`, body);
  }

  atender(id: number, body: AccionObservacionRequest): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.base}/${id}/atender`, body);
  }

  cerrar(id: number, body: AccionObservacionRequest): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.base}/${id}/cerrar`, body);
  }

  reabrir(id: number, body: AccionObservacionRequest): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.base}/${id}/reabrir`, body);
  }

  // ── Legacy PUT endpoints (kept for compatibility) ─────────────────────────

  cambiarEstado(id: number, body: ChangeStatusRequest): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.base}/${id}/status`, body);
  }

  asignarResponsable(id: number, body: AssignResponsibleRequest): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.base}/${id}/assign`, body);
  }

  setPrioridad(id: number, body: SetPriorityRequest): Observable<Solicitud> {
    return this.http.put<Solicitud>(`${this.base}/${id}/priority`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
