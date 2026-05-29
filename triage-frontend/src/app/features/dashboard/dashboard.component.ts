import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { Solicitud, EstadoSolicitud } from '../../core/models/solicitud.model';
import { UserSession } from '../../core/models/auth.model';

interface MetricCard { label: string; count: number; color: string; bg: string; icon: string; filterStatus?: EstadoSolicitud; }

@Component({
  standalone: false,
  selector: 'app-dashboard',
  template: `
    <div class="db-page">
      <div class="db-welcome">
        <div class="db-avatar">{{ initials }}</div>
        <div>
          <h1 class="db-title">Bienvenido, {{ user?.name }}</h1>
          <span class="db-role">{{ roleLabel }}</span>
        </div>
      </div>

      <div class="db-grid" *ngIf="!loading">
        <div class="db-card t-card" *ngFor="let card of cards"
             [class.clickable]="!!card.filterStatus"
             (click)="navigateFiltered(card.filterStatus)">
          <div class="db-card-icon" [style.background]="card.bg" [style.color]="card.color">{{ card.icon }}</div>
          <div class="db-card-val" [style.color]="card.color">{{ card.count }}</div>
          <div class="db-card-label">{{ card.label }}</div>
        </div>
      </div>

      <div class="db-loading" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="db-sections">
        <div class="t-card db-actions">
          <h2>Acciones rápidas</h2>
          <div class="db-action-list">
            <a class="db-action-item" routerLink="/solicitudes/nueva" *ngIf="canCreate">
              <div class="dai-icon">📝</div>
              <div><div class="dai-title">Nueva Solicitud</div><div class="dai-sub">Registrar una nueva solicitud académica</div></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
            <a class="db-action-item" routerLink="/solicitudes">
              <div class="dai-icon">📋</div>
              <div><div class="dai-title">Ver Solicitudes</div><div class="dai-sub">Listado completo de solicitudes</div></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
            <a class="db-action-item" routerLink="/admin/usuarios" *ngIf="isAdmin">
              <div class="dai-icon">👥</div>
              <div><div class="dai-title">Gestionar Usuarios</div><div class="dai-sub">Crear y administrar cuentas</div></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .db-page { padding: 28px; max-width: 1100px; margin: 0 auto; }
    .db-welcome { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .db-avatar { width: 52px; height: 52px; border-radius: 50%; background: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .db-title { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .db-role { display: inline-block; background: #eef2ff; color: #4f46e5; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .db-card { padding: 20px; cursor: default; transition: all .2s; }
    .db-card.clickable { cursor: pointer; }
    .db-card.clickable:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.1); }
    .db-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 14px; }
    .db-card-val { font-size: 36px; font-weight: 800; line-height: 1; margin-bottom: 6px; }
    .db-card-label { font-size: 13px; color: #64748b; font-weight: 500; }
    .db-loading { display: flex; justify-content: center; padding: 48px; }
    .db-sections { display: grid; grid-template-columns: 1fr; gap: 20px; }
    .db-actions { padding: 24px; }
    .db-actions h2 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
    .db-action-list { display: flex; flex-direction: column; gap: 4px; }
    .db-action-item { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 10px; text-decoration: none; transition: background .15s; }
    .db-action-item:hover { background: #f8fafc; }
    .dai-icon { width: 40px; height: 40px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .dai-title { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
    .dai-sub { font-size: 12px; color: #64748b; }
    .db-action-item svg { margin-left: auto; flex-shrink: 0; }
  `]
})
export class DashboardComponent implements OnInit {
  user: UserSession | null = null;
  cards: MetricCard[] = [];
  loading = true;

  constructor(public auth: AuthService, private solicitudSvc: SolicitudService, private router: Router) {}
  ngOnInit(): void { this.user = this.auth.getUser(); this.loadMetrics(); }
  get isAdmin(): boolean   { return this.auth.hasRole('ADMINISTRADOR'); }
  get canCreate(): boolean { return this.auth.hasAnyRole('ESTUDIANTE', 'ADMINISTRADOR', 'OPERADOR'); }
  get initials(): string   { return (this.user?.name ?? '').split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase(); }
  get roleLabel(): string  { return { ESTUDIANTE: 'Estudiante', OPERADOR: 'Operador', RESPONSABLE: 'Responsable', ADMINISTRADOR: 'Administrador' }[this.user?.role ?? ''] ?? ''; }
  navigateFiltered(status?: EstadoSolicitud): void { if (status) this.router.navigate(['/solicitudes'], { queryParams: { status } }); }
  private loadMetrics(): void {
    const src$ = this.auth.hasAnyRole('ESTUDIANTE', 'RESPONSABLE')
      ? this.solicitudSvc.misSolicitudes()
      : this.solicitudSvc.listar();
    src$.subscribe({ next: all => { this.cards = this.buildCards(all); this.loading = false; }, error: () => { this.loading = false; } });
  }
  private buildCards(all: Solicitud[]): MetricCard[] {
    const count = (s: EstadoSolicitud) => all.filter(r => r.status === s).length;
    const userId = this.user?.id;
    if (this.auth.hasRole('ESTUDIANTE')) {
      const mine = all.filter(r => r.applicant?.id === userId);
      return [
        { label: 'Mis activas', count: mine.filter(r => r.status !== 'CERRADA').length, color: '#4f46e5', bg: '#eef2ff', icon: '📋', filterStatus: 'REGISTRADA' },
        { label: 'Atendidas',   count: mine.filter(r => r.status === 'ATENDIDA').length, color: '#16a34a', bg: '#f0fdf4', icon: '✅', filterStatus: 'ATENDIDA' },
        { label: 'Cerradas',    count: mine.filter(r => r.status === 'CERRADA').length, color: '#dc2626', bg: '#fef2f2', icon: '🔒', filterStatus: 'CERRADA' },
      ];
    }
    if (this.auth.hasRole('RESPONSABLE')) {
      const mine = all.filter(r => r.responsible?.id === userId);
      return [
        { label: 'En atención', count: mine.filter(r => r.status === 'EN_ATENCION').length, color: '#d97706', bg: '#fffbeb', icon: '⚡', filterStatus: 'EN_ATENCION' },
        { label: 'Atendidas',   count: mine.filter(r => r.status === 'ATENDIDA').length, color: '#16a34a', bg: '#f0fdf4', icon: '✅', filterStatus: 'ATENDIDA' },
      ];
    }
    return [
      { label: 'Registradas',  count: count('REGISTRADA'),  color: '#475569', bg: '#f1f5f9', icon: '📥', filterStatus: 'REGISTRADA' },
      { label: 'Clasificadas', count: count('CLASIFICADA'), color: '#1d4ed8', bg: '#dbeafe', icon: '🏷️', filterStatus: 'CLASIFICADA' },
      { label: 'En Atención',  count: count('EN_ATENCION'), color: '#d97706', bg: '#fffbeb', icon: '⚡', filterStatus: 'EN_ATENCION' },
      { label: 'Atendidas',    count: count('ATENDIDA'),    color: '#16a34a', bg: '#f0fdf4', icon: '✅', filterStatus: 'ATENDIDA' },
      { label: 'Cerradas',     count: count('CERRADA'),     color: '#dc2626', bg: '#fef2f2', icon: '🔒', filterStatus: 'CERRADA' },
    ];
  }
}