import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export interface ConfirmDialogData {
  title: string;
  message: string;
  requireObservation?: boolean;
  observationLabel?: string;
}

@Component({ standalone: false,
  selector: 'app-confirm-dialog',
  template: `
    {{ data.title }}
    
      {{ data.message }}

      
        {{ data.observationLabel || 'Observación' }}
        
        La observación es obligatoria.
      
    
    
      Cancelar
      Confirmar
    
  `,
  styles: [`.full-width { width: 100%; margin-top: 12px; }`],
})
export class ConfirmDialogComponent {
  observationCtrl: FormControl;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    this.observationCtrl = new FormControl('',
      this.data.requireObservation ? Validators.required : []
    );
  }

  confirmar(): void {
    if (this.data.requireObservation && this.observationCtrl.invalid) return;
    this.dialogRef.close(this.observationCtrl.value ?? '');
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}

