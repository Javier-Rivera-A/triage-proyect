import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioResumen } from '../../core/models/solicitud.model';

@Component({
  standalone: false,
  selector: 'app-usuarios',
  template: `
    <div class="u-page">
      <div class="u-header">
        <div>
          <h1 class="u-title">Gestión de Usuarios</h1>
          <p class="u-sub">Administración de cuentas — solo ADMINISTRADOR</p>
        </div>
      </div>

      <div class="u-layout">
        <!-- Tabla -->
        <div class="t-card u-table-card">
          <div class="u-table-header">
            <h2>Usuarios registrados</h2>
            <div class="u-filters">
              <div class="u-search-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input class="u-search" [(ngModel)]="busqueda" (ngModelChange)="aplicarFiltro()" placeholder="Buscar usuario...">
              </div>
              <select class="u-rol-select" [(ngModel)]="filtroRol" (ngModelChange)="aplicarFiltro()">
                <option value="">Todos los roles</option>
                <option value="ESTUDIANTE">Estudiante</option>
                <option value="OPERADOR">Operador</option>
                <option value="RESPONSABLE">Responsable</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </div>
          </div>

          <div class="u-loading" *ngIf="loading">Cargando usuarios...</div>

          <table class="u-table" *ngIf="!loading">
            <thead><tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr></thead>
            <tbody>
              <tr *ngFor="let u of usuariosFiltrados" class="u-row">
                <td class="u-cell-user">
                  <div class="avatar" [style.background]="avatarColor(u.name)">{{ initials(u.name) }}</div>
                  <span class="u-name">{{ u.name }}</span>
                </td>
                <td class="u-email">{{ u.email }}</td>
                <td><span class="role-pill" [ngClass]="u.role">{{ roleLabel(u.role) }}</span></td>
                <td><span class="status-pill" [ngClass]="u.active ? 'active' : 'inactive'">{{ u.active ? 'Activo' : 'Inactivo' }}</span></td>
              </tr>
              <tr *ngIf="usuariosFiltrados.length === 0"><td colspan="4" class="u-empty">No se encontraron usuarios.</td></tr>
            </tbody>
          </table>
          <div class="u-count" *ngIf="!loading">{{ usuariosFiltrados.length }} de {{ usuarios.length }} usuarios</div>
        </div>

        <!-- Formulario -->
        <div class="t-card u-form-card">
          <h2>Crear nuevo usuario</h2>
          <form [formGroup]="crearForm" (ngSubmit)="crearUsuario()">
            <div class="t-field">
              <label class="t-label">Nombre completo</label>
              <input class="t-input" formControlName="name" placeholder="Juan Pérez">
              <span class="field-err" *ngIf="crearForm.get('name')?.touched && crearForm.get('name')?.invalid">Requerido.</span>
            </div>
            <div class="t-field">
              <label class="t-label">Correo electrónico</label>
              <input class="t-input" type="email" formControlName="email" placeholder="usuario@uni.edu.co">
              <span class="field-err" *ngIf="crearForm.get('email')?.touched && crearForm.get('email')?.invalid">Correo válido requerido.</span>
            </div>
            <div class="t-field">
              <label class="t-label">Contraseña</label>
              <input class="t-input" type="password" formControlName="password" placeholder="Mínimo 6 caracteres">
              <span class="field-err" *ngIf="crearForm.get('password')?.touched && crearForm.get('password')?.invalid">Mínimo 6 caracteres.</span>
            </div>
            <div class="t-field">
              <label class="t-label">Rol</label>
              <div class="role-options">
                <div class="role-option" *ngFor="let r of roles"
                     [class.selected]="crearForm.get('role')?.value === r.value"
                     (click)="crearForm.get('role')?.setValue(r.value)">
                  <span>{{ r.icon }}</span><span>{{ r.label }}</span>
                </div>
              </div>
            </div>
            <div class="error-banner" *ngIf="createError">{{ createError }}</div>
            <button class="t-btn primary create-btn" type="submit" [disabled]="crearForm.invalid || creating">
              {{ creating ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .u-page { padding: 28px; max-width: 1200px; margin: 0 auto; }
    .u-header { margin-bottom: 24px; }
    .u-title { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .u-sub { font-size: 14px; color: #64748b; }
    .u-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
    @media (max-width: 900px) { .u-layout { grid-template-columns: 1fr; } }

    .u-table-card { padding: 0; overflow: hidden; }
    .u-table-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 20px 20px 16px; border-bottom: 1px solid #f1f5f9; }
    .u-table-header h2 { font-size: 16px; font-weight: 700; color: #1e293b; }
    .u-filters { display: flex; gap: 10px; flex-wrap: wrap; }
    .u-search-wrap { display: flex; align-items: center; gap: 8px; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 12px; background: #fff; }
    .u-search { border: none; outline: none; font-size: 13px; color: #1e293b; width: 180px; }
    .u-rol-select { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 12px; font-size: 13px; outline: none; background: #fff; }
    .u-table { width: 100%; border-collapse: collapse; }
    .u-table thead tr { background: #f8fafc; }
    .u-table th { padding: 11px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .4px; }
    .u-row { border-bottom: 1px solid #f1f5f9; }
    .u-row:last-child { border-bottom: none; }
    .u-table td { padding: 13px 16px; font-size: 14px; color: #334155; vertical-align: middle; }
    .u-cell-user { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .u-name { font-weight: 500; }
    .u-email { color: #64748b; font-size: 13px; }
    .role-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .role-pill.ADMINISTRADOR { background: #fef3c7; color: #92400e; }
    .role-pill.OPERADOR      { background: #ede9fe; color: #5b21b6; }
    .role-pill.RESPONSABLE   { background: #dbeafe; color: #1d4ed8; }
    .role-pill.ESTUDIANTE    { background: #f0fdf4; color: #166534; }
    .status-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .status-pill.active { background: #dcfce7; color: #166534; }
    .status-pill.inactive { background: #fee2e2; color: #991b1b; }
    .u-empty { text-align: center; color: #94a3b8; padding: 32px; }
    .u-count { padding: 12px 20px; font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    .u-loading { text-align: center; padding: 40px; color: #64748b; }

    .u-form-card { padding: 24px; }
    .u-form-card h2 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
    .t-field { margin-bottom: 18px; }
    .t-label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .4px; }
    .t-input { width: 100%; padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color .15s; }
    .t-input:focus { border-color: #4f46e5; }
    .field-err { font-size: 12px; color: #dc2626; margin-top: 4px; display: block; }
    .role-options { display: flex; flex-direction: column; gap: 8px; }
    .role-option { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-size: 13px; transition: all .15s; }
    .role-option:hover { border-color: #a5b4fc; background: #f5f3ff; }
    .role-option.selected { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; font-weight: 600; }
    .error-banner { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }
    .create-btn { width: 100%; justify-content: center; padding: 11px; margin-top: 4px; }
    .t-btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; transition: all .15s; }
    .t-btn.primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
    .t-btn.primary:hover { background: #4338ca; }
    .t-btn:disabled { opacity: .5; cursor: not-allowed; }
  `]
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioResumen[] = [];
  usuariosFiltrados: UsuarioResumen[] = [];
  filtroRol = ''; busqueda = '';
  loading = true; creating = false; createError = '';
  crearForm: FormGroup;
  roles = [
    { value: 'ESTUDIANTE',    label: 'Estudiante',    icon: '🎓' },
    { value: 'OPERADOR',      label: 'Operador',      icon: '🖥️' },
    { value: 'RESPONSABLE',   label: 'Responsable',   icon: '👨‍💼' },
    { value: 'ADMINISTRADOR', label: 'Administrador', icon: '🔐' },
  ];
  private colors = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#3b82f6','#10b981'];

  constructor(private usuarioSvc: UsuarioService, private fb: FormBuilder, private snack: MatSnackBar) {
    this.crearForm = this.fb.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(6)]], role: ['', Validators.required] });
  }
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.loading = true;
    this.usuarioSvc.listar().subscribe({ next: u => { this.usuarios = u; this.aplicarFiltro(); this.loading = false; }, error: () => { this.loading = false; } });
  }
  aplicarFiltro(): void {
    this.usuariosFiltrados = this.usuarios.filter(u =>
      (!this.filtroRol || u.role === this.filtroRol) &&
      (!this.busqueda || u.name.toLowerCase().includes(this.busqueda.toLowerCase()) || u.email.toLowerCase().includes(this.busqueda.toLowerCase()))
    );
  }
  crearUsuario(): void {
    if (this.crearForm.invalid) { this.crearForm.markAllAsTouched(); return; }
    this.creating = true; this.createError = '';
    const { name, email, password, role } = this.crearForm.value;
    this.usuarioSvc.crear({ name, email, password, role }).subscribe({
      next: () => { this.creating = false; this.crearForm.reset(); this.snack.open('Usuario creado.', 'OK', { duration: 3000 }); this.cargar(); },
      error: err => { this.creating = false; this.createError = err.status === 409 ? 'Ya existe un usuario con ese correo.' : (err?.error?.message ?? 'Error al crear.'); }
    });
  }
  roleLabel(r: string): string { return { ESTUDIANTE: 'Estudiante', OPERADOR: 'Operador', RESPONSABLE: 'Responsable', ADMINISTRADOR: 'Administrador' }[r] ?? r; }
  initials(name: string): string { return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase(); }
  avatarColor(name: string): string { return this.colors[name.charCodeAt(0) % this.colors.length]; }
}