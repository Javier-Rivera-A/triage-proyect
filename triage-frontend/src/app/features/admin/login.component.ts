import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Sistema de Triage Académico</mat-card-title>
          <mat-card-subtitle>Ingresa tus credenciales para continuar</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
              <mat-error *ngIf="form.get('email')?.hasError('required')">El correo es obligatorio.</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput [type]="showPass ? 'text' : 'password'"
                     formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button"
                      (click)="showPass = !showPass">
                <mat-icon>{{ showPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.get('password')?.hasError('required')">La contraseña es obligatoria.</mat-error>
            </mat-form-field>

            <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

            <button mat-raised-button color="primary" class="full-width submit-btn"
                    type="submit" [disabled]="loading">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Ingresar</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .login-card { width: 400px; padding: 24px; }
    .full-width  { width: 100%; margin-bottom: 16px; }
    .submit-btn  { margin-top: 8px; height: 44px; }
    .error-msg   { color: #d32f2f; font-size: 14px; margin-bottom: 12px; }
  `],
})
export class LoginComponent {
  form: FormGroup;
  loading  = false;
  showPass = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // Si ya está autenticado, redirigir al dashboard
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading  = true;
    this.errorMsg = '';

    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next:  () => this.router.navigate(['/dashboard']),
      error: err => {
        this.loading  = false;
        this.errorMsg = err.status === 401
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : 'Error al conectar con el servidor.';
      },
    });
  }
}