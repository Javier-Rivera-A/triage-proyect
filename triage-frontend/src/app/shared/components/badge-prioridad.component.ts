import { Component, Input } from '@angular/core';
import { Prioridad, PRIORIDAD_LABELS } from '../../core/models/solicitud.model';

@Component({ standalone: false,
  selector: 'app-badge-prioridad',
  template: `
    <span class="badge" [ngClass]="cssClass" *ngIf="prioridad">
      {{ label }}
    </span>
    <span class="badge sin-prioridad" *ngIf="!prioridad">—</span>
  `,
  styles: [`
    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }
    .prioridad-P1_CRITICA { background: #ffcdd2; color: #b71c1c; }
    .prioridad-P2_ALTA    { background: #ffe0b2; color: #e65100; }
    .prioridad-P3_MEDIA   { background: #bbdefb; color: #1565c0; }
    .prioridad-P4_BAJA    { background: #e0e0e0; color: #424242; }
    .sin-prioridad    { color: #9e9e9e; font-size: 12px; }
  `],
})
export class BadgePrioridadComponent {
  @Input() prioridad: Prioridad | null = null;

  get label(): string {
    return this.prioridad ? (PRIORIDAD_LABELS[this.prioridad] ?? this.prioridad) : '';
  }

  get cssClass(): string {
    return `prioridad-${this.prioridad}`;
  }
}

