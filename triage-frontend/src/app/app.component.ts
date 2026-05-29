import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-root',
  template: `
    <ng-container *ngIf="auth.isLoggedIn(); else sinSesion">
      <nav class="topbar">
        <div class="topbar-brand" routerLink="/dashboard">
          <span class="brand-icon">🎓</span>
          <span class="brand-name">Triage Académico</span>
        </div>
        <div class="topbar-links">
          <a class="nav-link" routerLink="/solicitudes" routerLinkActive="active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            Solicitudes
          </a>
          <a class="nav-link" routerLink="/solicitudes/nueva" routerLinkActive="active"
             *ngIf="!auth.hasRole('RESPONSABLE')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Nueva
          </a>
          <a class="nav-link" routerLink="/admin/usuarios" routerLinkActive="active"
             *ngIf="auth.hasRole('ADMINISTRADOR')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            Usuarios
          </a>
        </div>
        <div class="topbar-user" [matMenuTriggerFor]="userMenu">
          <div class="user-avatar">{{ initials }}</div>
          <span class="user-name">{{ auth.getUser()?.name }}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <mat-menu #userMenu="matMenu" xPosition="before">
          <div class="menu-header">
            <strong>{{ auth.getUser()?.name }}</strong>
            <span>{{ roleLabel }}</span>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Cerrar sesión
          </button>
        </mat-menu>
      </nav>
      <main class="app-main"><router-outlet></router-outlet></main>
    </ng-container>
    <ng-template #sinSesion><router-outlet></router-outlet></ng-template>
  `,
  styles: [`
    .topbar {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; gap: 8px;
      height: 60px; padding: 0 24px;
      background: #fff; border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .topbar-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; margin-right: 24px; text-decoration: none; }
    .brand-icon { font-size: 22px; }
    .brand-name { font-size: 16px; font-weight: 700; color: #1e293b; }
    .topbar-links { display: flex; align-items: center; gap: 4px; flex: 1; }
    .nav-link {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
      color: #64748b; text-decoration: none; transition: all .15s;
    }
    .nav-link:hover { background: #f1f5f9; color: #1e293b; }
    .nav-link.active { background: #eef2ff; color: #4f46e5; }
    .topbar-user {
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      padding: 6px 12px; border-radius: 8px; transition: background .15s;
    }
    .topbar-user:hover { background: #f1f5f9; }
    .user-avatar {
      width: 32px; height: 32px; border-radius: 50%; background: #4f46e5;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff;
    }
    .user-name { font-size: 13px; font-weight: 500; color: #1e293b; }
    .menu-header { padding: 10px 16px; }
    .menu-header strong { display: block; font-size: 14px; }
    .menu-header span { font-size: 12px; color: #64748b; }
    .app-main { min-height: calc(100vh - 60px); background: #f0f2f5; }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}
  get roleLabel(): string {
    const map: Record<string, string> = { ESTUDIANTE: 'Estudiante', OPERADOR: 'Operador', RESPONSABLE: 'Responsable', ADMINISTRADOR: 'Administrador' };
    return map[this.auth.getUser()?.role ?? ''] ?? '';
  }
  get initials(): string {
    const name = this.auth.getUser()?.name ?? '';
    return name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }
  logout(): void { this.auth.logout(); this.router.navigate(['/login']); }
}