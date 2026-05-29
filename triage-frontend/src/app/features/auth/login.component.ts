import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  template: `
    <div class="login-bg">
      <div class="login-split">
        <div class="login-left">
          <div class="login-left-content">
            <div class="brand">🎓</div>
            <h1>Sistema de Triage<br>Académico</h1>
            <p>Gestión inteligente de solicitudes universitarias. Priorización automática y seguimiento en tiempo real.</p>
            <div class="features">
              <div class="feat"><span class="feat-dot"></span>Clasificación automática por IA</div>
              <div class="feat"><span class="feat-dot"></span>Historial auditable completo</div>
              <div class="feat"><span class="feat-dot"></span>Control de roles y permisos</div>
            </div>
          </div>
        </div>
        <div class="login-right">
          <div class="login-box">
            <h2>Iniciar sesión</h2>
            <p class="sub">Ingresa tus credenciales para continuar</p>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <div class="t-field">
                <label class="t-label">Correo electrónico</label>
                <input class="t-input" type="email" formControlName="email" placeholder="usuario@universidad.edu.co" autocomplete="email">
                <span class="field-err" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">Correo requerido y válido.</span>
              </div>
              <div class="t-field">
                <label class="t-label">Contraseña</label>
                <div class="pass-wrap">
                  <input class="t-input" [type]="showPass ? 'text' : 'password'" formControlName="password" placeholder="••••••••" autocomplete="current-password">
                  <button type="button" class="pass-toggle" (click)="showPass=!showPass">{{ showPass ? '🙈' : '👁' }}</button>
                </div>
                <span class="field-err" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">Contraseña requerida.</span>
              </div>
              <div class="error-banner" *ngIf="errorMsg">{{ errorMsg }}</div>
              <button class="t-btn primary submit-btn" type="submit" [disabled]="loading">
                <span *ngIf="!loading">Ingresar</span>
                <span *ngIf="loading">Verificando...</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-bg { min-height: 100vh; display: flex; }
    .login-split { display: flex; width: 100%; }
    .login-left {
      flex: 0 0 45%; background: linear-gradient(135deg, #4f46e5 0%, #0d9488 100%);
      display: flex; align-items: center; justify-content: center; padding: 48px;
    }
    .login-left-content { color: #fff; max-width: 340px; }
    .brand { font-size: 48px; margin-bottom: 24px; }
    .login-left-content h1 { font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
    .login-left-content p { font-size: 15px; opacity: .85; margin-bottom: 32px; line-height: 1.6; }
    .features { display: flex; flex-direction: column; gap: 12px; }
    .feat { display: flex; align-items: center; gap: 10px; font-size: 14px; opacity: .9; }
    .feat-dot { width: 8px; height: 8px; border-radius: 50%; background: #5eead4; flex-shrink: 0; }
    .login-right { flex: 1; display: flex; align-items: center; justify-content: center; background: #f0f2f5; padding: 48px; }
    .login-box { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,.1); padding: 40px; width: 100%; max-width: 400px; }
    .login-box h2 { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: #1e293b; }
    .sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }
    .t-field { margin-bottom: 18px; }
    .t-label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .4px; }
    .t-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color .15s; }
    .t-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .pass-wrap { position: relative; }
    .pass-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; }
    .field-err { font-size: 12px; color: #dc2626; margin-top: 4px; display: block; }
    .error-banner { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .submit-btn { width: 100%; justify-content: center; padding: 12px; font-size: 15px; margin-top: 4px; border-radius: 8px; }
    @media (max-width: 700px) { .login-left { display: none; } .login-right { padding: 24px; } }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false; showPass = false; errorMsg = '';
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.errorMsg = '';
    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.loading = false; this.errorMsg = err.status === 401 ? 'Credenciales incorrectas.' : 'Error al conectar con el servidor.'; }
    });
  }
}