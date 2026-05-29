import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SolicitudService } from '../../core/services/solicitud.service';
import { AuthService } from '../../core/services/auth.service';
import { TipoSolicitud, CanalOrigen, TIPO_LABELS, CANAL_LABELS } from '../../core/models/solicitud.model';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-solicitud-form',
  template: `
    <div class="sf-page">
      <div class="sf-header">
        <a class="sf-back" routerLink="/solicitudes">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Volver
        </a>
        <div>
          <h1 class="sf-title">Nueva Solicitud Académica</h1>
          <p class="sf-sub">Completa todos los campos para registrar tu solicitud</p>
        </div>
      </div>

      <div class="sf-layout">
        <div class="sf-main t-card">
          <form [formGroup]="form" (ngSubmit)="submit()">

            <div class="t-field">
              <label class="t-label">Tipo de Solicitud *</label>
              <div class="sf-tipo-grid">
                <div class="sf-tipo-option"
                     *ngFor="let t of tipos"
                     [class.selected]="form.get('type')?.value === t.value"
                     (click)="form.get('type')?.setValue(t.value)">
                  <span class="tipo-icon">{{ tipoIcon(t.value) }}</span>
                  <span class="tipo-label">{{ t.label }}</span>
                </div>
              </div>
              <span class="field-err" *ngIf="form.get('type')?.touched && form.get('type')?.invalid">Selecciona un tipo.</span>
            </div>

            <div class="t-field">
              <label class="t-label">Descripción *</label>
              <textarea class="t-textarea" formControlName="description" rows="5"
                        placeholder="Describe tu solicitud con detalle (mínimo 20 caracteres)..."></textarea>
              <div class="sf-hint-row">
                <span class="field-err" *ngIf="form.get('description')?.touched && form.get('description')?.hasError('minlength')">Mínimo 20 caracteres.</span>
                <span class="sf-counter">{{ form.get('description')?.value?.length ?? 0 }} / 20 mín.</span>
              </div>
            </div>

            <!-- Sugerencia IA -->
            <div class="ia-banner" *ngIf="sugerenciaIA">
              <div class="ia-icon">🤖</div>
              <div class="ia-text">
                <strong>Sugerencia IA:</strong> Tipo detectado: <em>{{ tipoLabel(sugerenciaIA.type) }}</em> — Prioridad sugerida: <em>{{ sugerenciaIA.priority }}</em>
              </div>
              <button class="t-btn" type="button" (click)="aplicarSugerencia()">Aplicar</button>
              <button class="ia-close" type="button" (click)="sugerenciaIA=null">✕</button>
            </div>

            <div class="t-field">
              <label class="t-label">Canal de Origen *</label>
              <div class="canal-grid">
                <div class="canal-option"
                     *ngFor="let c of canales"
                     [class.selected]="form.get('originChannel')?.value === c.value"
                     (click)="form.get('originChannel')?.setValue(c.value)">
                  {{ c.label }}
                </div>
              </div>
            </div>

            <div class="sf-solicitante">
              <div class="avatar" [style.background]="'#4f46e5'">{{ initials }}</div>
              <div>
                <div class="sol-name">{{ user?.name }}</div>
                <div class="sol-email">{{ user?.email }}</div>
              </div>
            </div>

            <div class="sf-actions">
              <a class="t-btn" routerLink="/solicitudes">Cancelar</a>
              <button class="t-btn primary" type="submit" [disabled]="form.invalid || submitting">
                <span *ngIf="!submitting">Registrar Solicitud</span>
                <span *ngIf="submitting">Registrando...</span>
              </button>
            </div>
          </form>
        </div>

        <div class="sf-aside">
          <div class="t-card sf-tip">
            <h3>💡 Consejos</h3>
            <ul>
              <li>Sé específico en la descripción para una clasificación más precisa.</li>
              <li>El sistema puede sugerir el tipo automáticamente basado en tu descripción.</li>
              <li>Recibirás notificaciones cuando el estado cambie.</li>
            </ul>
          </div>
          <div class="t-card sf-estados">
            <h3>Flujo de estados</h3>
            <div class="estado-flow">
              <div class="ef-step"><span class="pill REGISTRADA">Registrada</span></div>
              <div class="ef-arrow">→</div>
              <div class="ef-step"><span class="pill CLASIFICADA">Clasificada</span></div>
              <div class="ef-arrow">→</div>
              <div class="ef-step"><span class="pill EN_ATENCION">En Atención</span></div>
              <div class="ef-arrow">→</div>
              <div class="ef-step"><span class="pill ATENDIDA">Atendida</span></div>
              <div class="ef-arrow">→</div>
              <div class="ef-step"><span class="pill CERRADA">Cerrada</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sf-page { padding: 28px; max-width: 1000px; margin: 0 auto; }
    .sf-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
    .sf-back { display: flex; align-items: center; gap: 4px; color: #64748b; text-decoration: none; font-size: 13px; margin-top: 4px; padding: 6px 10px; border-radius: 6px; transition: background .15s; }
    .sf-back:hover { background: #f1f5f9; }
    .sf-title { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .sf-sub { font-size: 14px; color: #64748b; }
    .sf-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; }
    @media (max-width: 760px) { .sf-layout { grid-template-columns: 1fr; } }
    .sf-main { padding: 28px; }

    .t-field { margin-bottom: 22px; }
    .t-label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .4px; }
    .t-input, .t-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; transition: border-color .15s; font-family: inherit; }
    .t-input:focus, .t-textarea:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .t-textarea { resize: vertical; min-height: 120px; }

    .sf-tipo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
    .sf-tipo-option { border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px 12px; cursor: pointer; text-align: center; transition: all .15s; }
    .sf-tipo-option:hover { border-color: #a5b4fc; background: #f5f3ff; }
    .sf-tipo-option.selected { border-color: #4f46e5; background: #eef2ff; }
    .tipo-icon { display: block; font-size: 24px; margin-bottom: 6px; }
    .tipo-label { font-size: 12px; font-weight: 500; color: #334155; }

    .canal-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .canal-option { padding: 7px 16px; border: 1.5px solid #e2e8f0; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all .15s; }
    .canal-option:hover { border-color: #a5b4fc; }
    .canal-option.selected { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; font-weight: 600; }

    .sf-hint-row { display: flex; justify-content: space-between; margin-top: 4px; }
    .sf-counter { font-size: 12px; color: #94a3b8; }
    .field-err { font-size: 12px; color: #dc2626; }

    .ia-banner { display: flex; align-items: center; gap: 12px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; }
    .ia-icon { font-size: 20px; }
    .ia-text { flex: 1; font-size: 13px; color: #166534; }
    .ia-close { background: none; border: none; cursor: pointer; color: #64748b; font-size: 16px; }

    .sf-solicitante { display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 24px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; }
    .sol-name { font-weight: 600; font-size: 14px; color: #1e293b; }
    .sol-email { font-size: 12px; color: #64748b; }

    .sf-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9; }
    .t-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; text-decoration: none; transition: all .15s; }
    .t-btn:hover { background: #f8fafc; }
    .t-btn.primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
    .t-btn.primary:hover { background: #4338ca; }
    .t-btn:disabled { opacity: .5; cursor: not-allowed; }

    .sf-aside { display: flex; flex-direction: column; gap: 16px; }
    .sf-tip { padding: 20px; }
    .sf-tip h3, .sf-estados h3 { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #1e293b; }
    .sf-tip ul { padding-left: 16px; }
    .sf-tip li { font-size: 13px; color: #64748b; margin-bottom: 8px; line-height: 1.5; }
    .sf-estados { padding: 20px; }
    .estado-flow { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
    .ef-step { }
    .ef-arrow { font-size: 14px; color: #94a3b8; padding-left: 8px; }
    .pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .pill.REGISTRADA   { background: #f1f5f9; color: #475569; }
    .pill.CLASIFICADA  { background: #dbeafe; color: #1d4ed8; }
    .pill.EN_ATENCION  { background: #fef3c7; color: #92400e; }
    .pill.ATENDIDA     { background: #dcfce7; color: #166534; }
    .pill.CERRADA      { background: #fee2e2; color: #991b1b; }
  `]
})
export class SolicitudFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitting = false;
  sugerenciaIA: any = null;
  tipos  = Object.entries(TIPO_LABELS).map(([v, l]) => ({ value: v as TipoSolicitud, label: l }));
  canales = Object.entries(CANAL_LABELS).map(([v, l]) => ({ value: v as CanalOrigen, label: l }));
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private solicitudSvc: SolicitudService,
    public auth: AuthService, private router: Router, private http: HttpClient, private snack: MatSnackBar) {
    this.form = this.fb.group({ type: ['', Validators.required], description: ['', [Validators.required, Validators.minLength(20)]], originChannel: ['', Validators.required] });
  }
  get user() { return this.auth.getUser(); }
  get initials(): string { return (this.user?.name ?? '').split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase(); }

  ngOnInit(): void {
    this.form.get('description')!.valueChanges.pipe(
      debounceTime(800), filter(v => !!v && v.length > 30),
      switchMap(desc => this.http.post<any>(`${environment.apiUrl}/ia/sugerir`, { description: desc }).pipe(catchError(() => of(null)))),
      takeUntil(this.destroy$),
    ).subscribe(s => { if (s) this.sugerenciaIA = s; });
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
  aplicarSugerencia(): void { if (this.sugerenciaIA?.type) this.form.patchValue({ type: this.sugerenciaIA.type }); this.sugerenciaIA = null; }
  tipoLabel(t: TipoSolicitud): string { return TIPO_LABELS[t] ?? t; }
  tipoIcon(t: TipoSolicitud): string {
    const icons: Record<string, string> = {
      REGISTRO_ASIGNATURA: '📚', HOMOLOGACION: '🔄',
      CANCELACION_ASIGNATURA: '❌', SOLICITUD_CUPO: '🎟',
      CONSULTA_ACADEMICA: '❓', CORRECCION_NOTA: '✏️', CERTIFICADO_CONSTANCIA: '📜',
    };
    return icons[t] ?? '📄';
  }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const { type, description, originChannel } = this.form.value;
    this.solicitudSvc.registrar({ type, description, originChannel }).subscribe({
      next: created => { this.snack.open('Solicitud registrada.', 'OK', { duration: 3000 }); this.router.navigate(['/solicitudes', created.id]); },
      error: err => { this.submitting = false; this.snack.open(err?.error?.message ?? 'Error al registrar.', 'Cerrar', { duration: 5000 }); }
    });
  }
}