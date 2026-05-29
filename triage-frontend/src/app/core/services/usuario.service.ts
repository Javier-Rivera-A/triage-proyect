import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioResumen } from '../models/solicitud.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioResumen[]> {
    return this.http.get<UsuarioResumen[]>(this.base);
  }

  obtener(id: number): Observable<UsuarioResumen> {
    return this.http.get<UsuarioResumen>(`${this.base}/${id}`);
  }

  crear(body: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Observable<UsuarioResumen> {
    return this.http.post<UsuarioResumen>(this.base, body);
  }

  /** Listar solo usuarios con rol RESPONSIBLE que estén activos — para el
   *  formulario de asignación de responsable (RF-05) */
  listarResponsables(): Observable<UsuarioResumen[]> {
    return new Observable(observer => {
      this.listar().subscribe({
        next: users => observer.next(
          users.filter(u => (u.role === 'RESPONSABLE' || u.role === 'ADMINISTRADOR') && u.active)
        ),
        error: err => observer.error(err),
        complete: () => observer.complete(),
      });
    });
  }
}