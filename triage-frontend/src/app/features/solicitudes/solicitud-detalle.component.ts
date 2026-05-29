import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolicitudService } from '../../core/services/solicitud.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Solicitud, HistorialAccion, UsuarioResumen,
  EstadoSolicitud, Prioridad, TipoSolicitud, CanalOrigen,
  ESTADO_LABELS, TIPO_LABELS, PRIORIDAD_LABELS, CANAL_LABELS,
} from '../../core/models/solicitud.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  standalone: false,
  selector: 'app-solicitud-detalle',
  template: `
    <div class="sd-page" *ngIf="solicitud && !loading">

      <!-- Cabecera -->
      <div class="sd-header">
        <a class="sd-back" routerLink="/solicitudes">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Solicitudes
        </a>
        <div class="sd-heading">
          <h1 class="sd-title">Solicitud <span class="id-chip">#{{ solicitud.id }}</span></h1>
          <p class="sd-sub">{{ tipoLabel(solicitud.type) }}</p>
        </div>
        <div class="sd-badges">
          <app-badge-estado [estado]="solicitud.status"></app-badge-estado>
          <app-badge-prioridad [prioridad]="solicitud.priority"></app-badge-prioridad>
        </div>
      </div>

      <div class="sd-layout">

        <!-- Panel principal de info -->
        <div class="t-card sd-info">
          <h2 class="panel-title">Datos de la Solicitud</h2>

          <div class="info-field full">
            <span class="info-label">Descripción</span>
            <span class="info-val desc">{{ solicitud.description }}</span>
          </div>

          <div class="info-grid">
            <div class="info-field">
              <span class="info-label">Canal de Origen</span>
              <span class="info-val">
                <span class="canal-pill">{{ canalLabel(solicitud.originChannel) }}</span>
              </span>
            </div>
            <div class="info-field">
              <span class="info-label">Fecha de Registro</span>
              <span class="info-val">{{ solicitud.registrationDate | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">Solicitante</span>
              <div class="info-user">
                <div class="user-av">{{ initials(solicitud.applicant?.name) }}</div>
                <div>
                  <div class="user-name">{{ solicitud.applicant?.name }}</div>
                  <div class="user-email">{{ solicitud.applicant?.email }}</div>
                </div>
              </div>
            </div>
            <div class="info-field">
              <span class="info-label">Responsable</span>
              <div class="info-user" *ngIf="solicitud.responsible">
                <div class="user-av resp">{{ initials(solicitud.responsible?.name) }}</div>
                <div>
                  <div class="user-name">{{ solicitud.responsible?.name }}</div>
                  <div class="user-email">{{ solicitud.responsible?.email }}</div>
                </div>
              </div>
              <span class="info-val unassigned" *ngIf="!solicitud.responsible">Sin asignar</span>
            </div>
          </div>

          <div class="info-field full" *ngIf="solicitud.priorityJustification">
            <span class="info-label">Justificación de Prioridad</span>
            <span class="info-val justif">{{ solicitud.priorityJustification }}</span>
          </div>
        </div>

        <!-- Panel de acciones -->
        <div class="t-card sd-actions" *ngIf="solicitud.status !== 'CERRADA'">
          <h2 class="panel-title">Acciones Disponibles</h2>

          <!-- Clasificar: REGISTRADA → CLASIFICADA (OPERADOR, ADMINISTRADOR) -->
          <div class="action-block" *ngIf="solicitud.status === 'REGISTRADA' && canClasificar">
            <p class="action-desc">Asigna prioridad y clasifica la solicitud para asignarla.</p>
            <div class="t-field">
              <label class="t-label">Prioridad</label>
              <select class="t-select" [(ngModel)]="accionPrioridad">
                <option value="" disabled>Seleccionar...</option>
                <option *ngFor="let p of prioridades" [value]="p.value">{{ p.label }}</option>
              </select>
            </div>
            <div class="t-field">
              <label class="t-label">Justificación</label>
              <input class="t-input" [(ngModel)]="accionJustificacion" placeholder="Opcional...">
            </div>
            <button class="t-btn primary full" [disabled]="!accionPrioridad" (click)="clasificar()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              Clasificar y Priorizar
            </button>
          </div>

          <!-- Asignar responsable: CLASIFICADA (OPERADOR, ADMINISTRADOR) -->
          <div class="action-block" *ngIf="solicitud.status === 'CLASIFICADA' && canClasificar">
            <p class="action-desc">Selecciona el responsable para atender esta solicitud.</p>
            <div class="t-field">
              <label class="t-label">Responsable</label>
              <select class="t-select" [(ngModel)]="accionResponsableId">
                <option [value]="null" disabled>Seleccionar responsable...</option>
                <option *ngFor="let u of responsables" [value]="u.id">{{ u.name }}</option>
              </select>
            </div>
            <button class="t-btn primary full" [disabled]="!accionResponsableId" (click)="asignar()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Asignar Responsable
            </button>
          </div>

          <!-- Marcar atendida: EN_ATENCION (RESPONSABLE, ADMINISTRADOR) -->
          <div class="action-block" *ngIf="solicitud.status === 'EN_ATENCION' && (canResponsable || canAdmin)">
            <p class="action-desc">Marca la solicitud como atendida cuando hayas completado el proceso.</p>
            <button class="t-btn success full" (click)="marcarAtendida()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Marcar como Atendida
            </button>
          </div>

          <!-- Cerrar / Reabrir: ATENDIDA (solo ADMINISTRADOR) -->
          <div class="action-block" *ngIf="solicitud.status === 'ATENDIDA' && canAdmin">
            <p class="action-desc">Cierra formalmente la solicitud. Esta acción es irreversible.</p>
            <button class="t-btn danger full" (click)="cerrar()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Cerrar Solicitud
            </button>
            <button class="t-btn full" style="margin-top:8px" (click)="reabrir()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
              Reabrir (volver a En Atención)
            </button>
          </div>

          <div class="no-actions" *ngIf="!hayAccionesDisponibles">
            Sin acciones disponibles para tu rol en este estado.
          </div>
        </div>

        <!-- Solicitud cerrada -->
        <div class="t-card sd-closed" *ngIf="solicitud.status === 'CERRADA'">
          <div class="closed-icon">🔒</div>
          <p class="closed-title">Solicitud Cerrada</p>
          <p class="closed-sub">Esta solicitud está cerrada. No se permiten más modificaciones.</p>
        </div>

      </div>

      <!-- Historial auditable -->
      <div class="t-card sd-history">
        <h2 class="panel-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Historial Auditable
        </h2>
        <div class="history-loading" *ngIf="loadingHistorial">
          <div class="spinner"></div>
        </div>
        <app-historial-timeline *ngIf="!loadingHistorial" [historial]="historial"></app-historial-timeline>
      </div>

    </div>

    <div class="sd-loading" *ngIf="loading">
      <div class="spinner lg"></div>
    </div>
  `,
  styles: [`
    .sd-page { padding: 28px; max-width: 1100px; margin: 0 auto; }

    .sd-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .sd-back { display: flex; align-items: center; gap: 4px; color: #64748b; text-decoration: none; font-size: 13px; padding: 6px 10px; border-radius: 6px; margin-top: 4px; transition: background .15s; flex-shrink: 0; }
    .sd-back:hover { background: #f1f5f9; }
    .sd-heading { flex: 1; }
    .sd-title { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 4px; display: flex; align-items: center; gap: 10px; }
    .id-chip { background: #f1f5f9; color: #475569; padding: 2px 10px; border-radius: 8px; font-size: 15px; font-weight: 600; font-family: monospace; }
    .sd-sub { font-size: 14px; color: #64748b; }
    .sd-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 4px; }

    .sd-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; margin-bottom: 20px; }
    @media (max-width: 800px) { .sd-layout { grid-template-columns: 1fr; } }

    .t-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
    .panel-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }

    .sd-info { padding: 24px; }
    .info-field { display: flex; flex-direction: column; gap: 5px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .info-field:last-child { border-bottom: none; }
    .info-field.full { }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
    .info-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
    .info-val { font-size: 14px; color: #1e293b; }
    .info-val.desc { line-height: 1.6; color: #334155; }
    .info-val.justif { font-style: italic; color: #4f46e5; font-size: 13px; }
    .info-val.unassigned { color: #94a3b8; font-style: italic; }
    .canal-pill { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #475569; }
    .info-user { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
    .user-av { width: 32px; height: 32px; border-radius: 50%; background: #4f46e5; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .user-av.resp { background: #0891b2; }
    .user-name { font-size: 13px; font-weight: 600; color: #1e293b; }
    .user-email { font-size: 11px; color: #94a3b8; }

    .sd-actions { padding: 24px; }
    .action-block { }
    .action-desc { font-size: 13px; color: #64748b; margin-bottom: 16px; line-height: 1.5; }
    .t-field { margin-bottom: 14px; }
    .t-label { display: block; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 6px; }
    .t-input, .t-select { width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #1e293b; background: #fff; outline: none; font-family: inherit; box-sizing: border-box; }
    .t-input:focus, .t-select:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .t-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; transition: all .15s; text-decoration: none; }
    .t-btn:hover { background: #f8fafc; }
    .t-btn.primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
    .t-btn.primary:hover { background: #4338ca; }
    .t-btn.success { background: #16a34a; color: #fff; border-color: #16a34a; }
    .t-btn.success:hover { background: #15803d; }
    .t-btn.danger { background: #dc2626; color: #fff; border-color: #dc2626; }
    .t-btn.danger:hover { background: #b91c1c; }
    .t-btn.full { width: 100%; }
    .t-btn:disabled { opacity: .5; cursor: not-allowed; }
    .no-actions { text-align: center; padding: 24px; color: #94a3b8; font-size: 13px; font-style: italic; }

    .sd-closed { padding: 40px 24px; text-align: center; }
    .closed-icon { font-size: 44px; margin-bottom: 12px; }
    .closed-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
    .closed-sub { font-size: 13px; color: #64748b; }

    .sd-history { padding: 24px; margin-top: 0; }
    .history-loading { display: flex; justify-content: center; padding: 32px; }

    .sd-loading { display: flex; justify-content: center; padding: 80px; }
    .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin .7s linear infinite; }
    .spinner.lg { width: 40px; height: 40px; border-width: 4px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class SolicitudDetalleComponent implements OnInit {
  solicitud: Solicitud | null = null;
  historial: HistorialAccion[] = [];
  responsables: UsuarioResumen[] = [];
  loading = true;
  loadingHistorial = true;

  accionPrioridad: Prioridad | '' = '';
  accionJustificacion = '';
  accionResponsableId: number | null = null;

  prioridades = [
    { value: 'P1_CRITICA' as Prioridad, label: 'P1 – Crítica' },
    { value: 'P2_ALTA'    as Prioridad, label: 'P2 – Alta'    },
    { value: 'P3_MEDIA'   as Prioridad, label: 'P3 – Media'   },
    { value: 'P4_BAJA'    as Prioridad, label: 'P4 – Baja'    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudSvc: SolicitudService,
    private usuarioSvc: UsuarioService,
    public auth: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  get canAdmin():       boolean { return this.auth.hasRole('ADMINISTRADOR'); }
  get canResponsable(): boolean { return this.auth.hasRole('RESPONSABLE'); }
  get canClasificar():  boolean { return this.auth.hasAnyRole('OPERADOR', 'ADMINISTRADOR'); }

  get hayAccionesDisponibles(): boolean {
    if (!this.solicitud) return false;
    const s = this.solicitud.status;
    if (s === 'REGISTRADA'  && this.canClasificar) return true;
    if (s === 'CLASIFICADA' && this.canClasificar) return true;
    if (s === 'EN_ATENCION' && (this.canAdmin || this.canResponsable)) return true;
    if (s === 'ATENDIDA'    && this.canAdmin) return true;
    return false;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarSolicitud(id);
    this.cargarHistorial(id);
    if (this.canClasificar) {
      this.usuarioSvc.listarResponsables().subscribe(r => { this.responsables = r; });
    }
  }

  private cargarSolicitud(id: number): void {
    this.solicitudSvc.obtener(id).subscribe({
      next:  s => { this.solicitud = s; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.router.navigate(['/solicitudes']); },
    });
  }

  private cargarHistorial(id: number): void {
    this.solicitudSvc.obtenerHistorial(id).subscribe({
      next:  h => { this.historial = h; this.loadingHistorial = false; this.cdr.detectChanges(); },
      error: () => { this.loadingHistorial = false; },
    });
  }

  clasificar(): void {
    if (!this.solicitud || !this.accionPrioridad) return;
    const id = this.solicitud.id;
    this.solicitudSvc.clasificar(id, {
      prioridad: this.accionPrioridad as Prioridad,
      justificacion: this.accionJustificacion || undefined,
    }).subscribe({
      next: updated => {
        this.solicitud = updated;
        this.snack.open('Solicitud clasificada.', 'OK', { duration: 3000 });
        this.cargarHistorial(id);
        this.cdr.detectChanges();
      },
      error: err => this.mostrarError(err),
    });
  }

  asignar(): void {
    if (!this.solicitud || !this.accionResponsableId) return;
    const id = this.solicitud.id;
    this.solicitudSvc.asignar(id, { responsableId: this.accionResponsableId }).subscribe({
      next: updated => {
        this.solicitud = updated;
        this.snack.open('Responsable asignado.', 'OK', { duration: 3000 });
        this.cargarHistorial(id);
        this.cdr.detectChanges();
      },
      error: err => this.mostrarError(err),
    });
  }

  marcarAtendida(): void {
    this.abrirConfirm('Marcar como Atendida', '¿Confirmas que la solicitud ha sido atendida?', false, 'Observación (opcional)')
      .subscribe(obs => {
        if (obs === null) return;
        const id = this.solicitud!.id;
        this.solicitudSvc.atender(id, { observacion: obs || undefined }).subscribe({
          next: updated => {
            this.solicitud = updated;
            this.snack.open('Marcada como atendida.', 'OK', { duration: 3000 });
            this.cargarHistorial(id);
            this.cdr.detectChanges();
          },
          error: err => this.mostrarError(err),
        });
      });
  }

  cerrar(): void {
    this.abrirConfirm('Cerrar Solicitud', 'Una vez cerrada no podrá ser modificada.', true, 'Observación de cierre (obligatoria)')
      .subscribe(obs => {
        if (obs === null) return;
        const id = this.solicitud!.id;
        this.solicitudSvc.cerrar(id, { observacion: obs }).subscribe({
          next: updated => {
            this.solicitud = updated;
            this.snack.open('Solicitud cerrada.', 'OK', { duration: 3000 });
            this.cargarHistorial(id);
            this.cdr.detectChanges();
          },
          error: err => this.mostrarError(err),
        });
      });
  }

  reabrir(): void {
    this.abrirConfirm('Reabrir Solicitud', '¿Deseas volver la solicitud al estado "En Atención"?', false, 'Justificación')
      .subscribe(obs => {
        if (obs === null) return;
        const id = this.solicitud!.id;
        this.solicitudSvc.reabrir(id, { observacion: obs || undefined }).subscribe({
          next: updated => {
            this.solicitud = updated;
            this.snack.open('Solicitud reabierta.', 'OK', { duration: 3000 });
            this.cargarHistorial(id);
            this.cdr.detectChanges();
          },
          error: err => this.mostrarError(err),
        });
      });
  }

  private abrirConfirm(title: string, message: string, requireObs: boolean, obsLabel: string) {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { title, message, requireObservation: requireObs, observationLabel: obsLabel },
    }).afterClosed();
  }

  private mostrarError(err: any): void {
    this.snack.open(err?.error?.message ?? 'Ocurrió un error. Inténtalo de nuevo.', 'Cerrar', { duration: 5000 });
  }

  initials(name: string = ''): string { return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase(); }
  tipoLabel(t: TipoSolicitud):    string { return TIPO_LABELS[t]      ?? t; }
  canalLabel(c: CanalOrigen):     string { return CANAL_LABELS[c]     ?? c; }
  estadoLabel(e: EstadoSolicitud):string { return ESTADO_LABELS[e]    ?? e; }
  prioridadLabel(p: Prioridad):   string { return PRIORIDAD_LABELS[p] ?? p; }
}
