import { Component, Input } from '@angular/core';
import { EstadoSolicitud, ESTADO_LABELS } from '../../core/models/solicitud.model';

@Component({ standalone: false,
  selector: 'app-badge-estado',
  template: `
    <span class="badge" [ngClass]="cssClass">{{ label }}</span>
  `,
  styles: [`
    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }
    .estado-REGISTRADA   { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .estado-CLASIFICADA  { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
    .estado-EN_ATENCION  { background: #fef3c7; color: #b45309; border: 1px solid #fcd34d; }
    .estado-ATENDIDA     { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .estado-CERRADA      { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
  `],
})
export class BadgeEstadoComponent {
  @Input() estado!: EstadoSolicitud;

  get label(): string {
    return ESTADO_LABELS[this.estado] ?? this.estado;
  }

  get cssClass(): string {
    return `estado-${this.estado}`;
  }
}

