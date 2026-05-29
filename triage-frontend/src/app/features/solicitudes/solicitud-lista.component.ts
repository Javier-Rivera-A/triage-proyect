import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { SolicitudService } from '../../core/services/solicitud.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Solicitud, EstadoSolicitud, TipoSolicitud, Prioridad,
  ESTADO_LABELS, TIPO_LABELS, PRIORIDAD_LABELS,
} from '../../core/models/solicitud.model';

@Component({
  standalone: false,
  selector: 'app-solicitud-lista',
  template: `
    <div class="sl-page">

      <!-- Header -->
      <div class="sl-header">
        <div>
          <h1 class="sl-title">Solicitudes Académicas</h1>
          <p class="sl-sub">Gestión y seguimiento de solicitudes del programa</p>
        </div>
        <a class="t-btn primary" routerLink="/solicitudes/nueva" *ngIf="canCreate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Solicitud
        </a>
      </div>

      <!-- Filtros -->
      <div class="sl-filters t-card" *ngIf="canFilter">
        <div class="sf-grid">
          <div class="sf-field">
            <label class="sf-label">Estado</label>
            <select class="sf-select" [(ngModel)]="filtroEstado" (ngModelChange)="aplicarFiltros()">
              <option value="">Todos</option>
              <option *ngFor="let e of estados" [value]="e.value">{{ e.label }}</option>
            </select>
          </div>
          <div class="sf-field">
            <label class="sf-label">Tipo</label>
            <select class="sf-select" [(ngModel)]="filtroTipo" (ngModelChange)="aplicarFiltros()">
              <option value="">Todos</option>
              <option *ngFor="let t of tipos" [value]="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="sf-field">
            <label class="sf-label">Prioridad</label>
            <select class="sf-select" [(ngModel)]="filtroPrioridad" (ngModelChange)="aplicarFiltros()">
              <option value="">Todas</option>
              <option *ngFor="let p of prioridades" [value]="p.value">{{ p.label }}</option>
            </select>
          </div>
          <button class="t-btn" (click)="limpiarFiltros()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Limpiar
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="sl-loading" *ngIf="loading">
        <div class="spinner"></div>
        <span>Cargando solicitudes...</span>
      </div>

      <!-- Tabla -->
      <div class="t-card sl-table-card" *ngIf="!loading">

        <!-- Estadísticas rápidas -->
        <div class="sl-stats" *ngIf="canFilter">
          <div class="sl-stat" *ngFor="let s of statsBarras">
            <span class="sl-stat-dot" [style.background]="s.color"></span>
            <span class="sl-stat-label">{{ s.label }}</span>
            <span class="sl-stat-count">{{ s.count }}</span>
          </div>
        </div>

        <div class="table-scroll">
          <table mat-table [dataSource]="dataSource" class="sl-table">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let row">
                <span class="id-badge">#{{ row.id }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="tipo">
              <th mat-header-cell *matHeaderCellDef>Tipo de Solicitud</th>
              <td mat-cell *matCellDef="let row">
                <div class="tipo-cell">
                  <span class="tipo-icon">{{ tipoIcon(row.type) }}</span>
                  <span>{{ tipoLabel(row.type) }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let row">
                <app-badge-estado [estado]="row.status"></app-badge-estado>
              </td>
            </ng-container>

            <ng-container matColumnDef="prioridad">
              <th mat-header-cell *matHeaderCellDef>Prioridad</th>
              <td mat-cell *matCellDef="let row">
                <app-badge-prioridad [prioridad]="row.priority"></app-badge-prioridad>
              </td>
            </ng-container>

            <ng-container matColumnDef="solicitante">
              <th mat-header-cell *matHeaderCellDef>Solicitante</th>
              <td mat-cell *matCellDef="let row">
                <div class="user-cell">
                  <div class="user-avatar-sm">{{ initials(row.applicant?.name) }}</div>
                  <span>{{ row.applicant?.name }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let row" class="fecha-cell">
                {{ row.registrationDate | date:'dd/MM/yy' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <a class="ver-btn" [routerLink]="['/solicitudes', row.id]">
                  Ver
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas;"
                class="sl-row"
                [routerLink]="['/solicitudes', row.id]"></tr>
          </table>
        </div>

        <!-- Empty state -->
        <div class="sl-empty" *ngIf="dataSource.data.length === 0">
          <div class="empty-icon">📭</div>
          <p class="empty-title">Sin resultados</p>
          <p class="empty-sub">No se encontraron solicitudes con los filtros seleccionados.</p>
          <button class="t-btn" (click)="limpiarFiltros()">Limpiar filtros</button>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .sl-page { padding: 28px; max-width: 1200px; margin: 0 auto; }

    .sl-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .sl-title { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .sl-sub { font-size: 13px; color: #64748b; }

    .t-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .t-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; text-decoration: none; transition: all .15s; }
    .t-btn:hover { background: #f8fafc; }
    .t-btn.primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
    .t-btn.primary:hover { background: #4338ca; }

    /* Filtros */
    .sl-filters { padding: 16px 20px; margin-bottom: 16px; }
    .sf-grid { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
    .sf-field { display: flex; flex-direction: column; gap: 4px; min-width: 160px; }
    .sf-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .4px; }
    .sf-select { padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #1e293b; background: #fff; outline: none; cursor: pointer; }
    .sf-select:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }

    /* Loading */
    .sl-loading { display: flex; align-items: center; gap: 12px; justify-content: center; padding: 60px; color: #64748b; font-size: 14px; }
    .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Tabla */
    .sl-table-card { overflow: hidden; }
    .sl-stats { display: flex; flex-wrap: wrap; gap: 20px; padding: 16px 24px; border-bottom: 1px solid #f1f5f9; }
    .sl-stat { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; }
    .sl-stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .sl-stat-count { font-weight: 700; color: #1e293b; }

    .table-scroll { overflow-x: auto; }
    .sl-table { width: 100%; border-collapse: collapse; }
    ::ng-deep .sl-table th.mat-mdc-header-cell {
      font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;
      letter-spacing: .5px; padding: 12px 16px; background: #f8fafc;
      border-bottom: 1px solid #e2e8f0; white-space: nowrap;
    }
    ::ng-deep .sl-table td.mat-mdc-cell {
      padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;
    }
    .sl-row { cursor: pointer; transition: background .12s; }
    .sl-row:hover { background: #f8fafc; }

    .id-badge { background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; font-family: monospace; }
    .tipo-cell { display: flex; align-items: center; gap: 8px; }
    .tipo-icon { font-size: 16px; }
    .user-cell { display: flex; align-items: center; gap: 8px; }
    .user-avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: #4f46e5; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .fecha-cell { white-space: nowrap; color: #64748b; font-size: 12px; }
    .ver-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; color: #4f46e5; border: 1px solid #c7d2fe; background: #eef2ff; text-decoration: none; transition: all .12s; }
    .ver-btn:hover { background: #e0e7ff; }

    .sl-empty { text-align: center; padding: 60px 24px; }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-title { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 6px; }
    .empty-sub { font-size: 13px; color: #64748b; margin-bottom: 20px; }

    ::ng-deep .mat-mdc-paginator { border-top: 1px solid #f1f5f9; font-size: 13px; }
  `],
})
export class SolicitudListaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private cargar$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  dataSource = new MatTableDataSource<Solicitud>();
  columnas = ['id', 'tipo', 'estado', 'prioridad', 'solicitante', 'fecha', 'acciones'];
  loading = true;

  filtroEstado: EstadoSolicitud | '' = '';
  filtroTipo: TipoSolicitud | '' = '';
  filtroPrioridad: Prioridad | '' = '';

  estados = Object.entries(ESTADO_LABELS).map(([v, l]) => ({ value: v as EstadoSolicitud, label: l }));
  tipos = Object.entries(TIPO_LABELS).map(([v, l]) => ({ value: v as TipoSolicitud, label: l }));
  prioridades = Object.entries(PRIORIDAD_LABELS).map(([v, l]) => ({ value: v as Prioridad, label: l }));

  get statsBarras() {
    const all = this.dataSource.data;
    return [
      { label: 'Registradas',  count: all.filter(r => r.status === 'REGISTRADA').length,  color: '#94a3b8' },
      { label: 'Clasificadas', count: all.filter(r => r.status === 'CLASIFICADA').length, color: '#3b82f6' },
      { label: 'En Atención',  count: all.filter(r => r.status === 'EN_ATENCION').length, color: '#f59e0b' },
      { label: 'Atendidas',    count: all.filter(r => r.status === 'ATENDIDA').length,    color: '#22c55e' },
      { label: 'Cerradas',     count: all.filter(r => r.status === 'CERRADA').length,     color: '#ef4444' },
    ];
  }

  constructor(
    private solicitudSvc: SolicitudService,
    public auth: AuthService,
    private route: ActivatedRoute,
  ) {}

  get canCreate(): boolean { return !this.auth.hasRole('RESPONSABLE'); }
  get canFilter(): boolean { return this.auth.hasAnyRole('ADMINISTRADOR', 'OPERADOR'); }

  private esRolLimitado(): boolean {
    return this.auth.hasAnyRole('ESTUDIANTE', 'RESPONSABLE');
  }

  ngOnInit(): void {
    this.cargar$.pipe(
      switchMap(() => {
        if (this.esRolLimitado()) {
          return this.solicitudSvc.misSolicitudes();
        }
        const filtros: any = {};
        if (this.filtroEstado)    filtros.status   = this.filtroEstado;
        if (this.filtroTipo)      filtros.type     = this.filtroTipo;
        if (this.filtroPrioridad) filtros.priority = this.filtroPrioridad;
        return this.solicitudSvc.listar(filtros);
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next:  data => { this.dataSource.data = data; this.loading = false; },
      error: ()   => { this.loading = false; },
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['status']) this.filtroEstado = params['status'];
      this.cargar();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  cargar(): void {
    this.loading = true;
    this.cargar$.next();
  }

  aplicarFiltros(): void { this.cargar(); }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroTipo = '';
    this.filtroPrioridad = '';
    this.cargar();
  }

  tipoLabel(t: TipoSolicitud): string { return TIPO_LABELS[t] ?? t; }
  tipoIcon(t: TipoSolicitud): string {
    const icons: Record<string, string> = {
      REGISTRO_ASIGNATURA: '📚', HOMOLOGACION: '🔄',
      CANCELACION_ASIGNATURA: '❌', SOLICITUD_CUPO: '🎟', CONSULTA_ACADEMICA: '❓',
      CORRECCION_NOTA: '✏️', CERTIFICADO_CONSTANCIA: '📜',
    };
    return icons[t] ?? '📄';
  }
  initials(name: string = ''): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
