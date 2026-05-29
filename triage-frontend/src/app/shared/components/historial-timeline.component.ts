import { Component, Input } from '@angular/core';
import { HistorialAccion } from '../../core/models/solicitud.model';

@Component({
  standalone: false,
  selector: 'app-historial-timeline',
  template: `
    <div class="timeline" *ngIf="historial && historial.length > 0; else vacio">
      <div class="entry" *ngFor="let entry of historial">
        <div class="dot"></div>
        <div class="content">
          <div class="action">{{ entry.action }}</div>
          <div class="meta">
            <span>{{ entry.user?.name }}</span>
            <span>{{ entry.actionDate | date:"dd/MM/yyyy HH:mm" }}</span>
          </div>
          <div *ngIf="entry.observations">{{ entry.observations }}</div>
        </div>
      </div>
    </div>
    <ng-template #vacio><p>Sin registros de historial.</p></ng-template>
  `,
  styles: [`
    .timeline { position: relative; padding-left: 24px; }
    .entry { position:relative; margin-bottom:20px; }
    .dot { position:absolute; left:-20px; top:4px; width:12px; height:12px; border-radius:50%; background:#1976d2; }
    .content { background:#f5f5f5; border-radius:8px; padding:10px 14px; }
    .action { font-weight:600; font-size:14px; margin-bottom:4px; }
    .meta { display:flex; gap:16px; font-size:12px; color:#757575; }
  `],
})
export class HistorialTimelineComponent {
  @Input() historial: HistorialAccion[] = [];
}
