import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, UserSession } from '../models/auth.model';
import { RolUsuario } from '../models/solicitud.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'triage_token';
  private readonly USER_KEY  = 'triage_user';

  private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Restaurar sesión de localStorage al arrancar la app
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      try {
        this.currentUserSubject.next(JSON.parse(stored));
      } catch {
        this.clearStorage();
      }
    }
  }

  // ── POST /auth/login ──────────────────────────────────────────────────────
  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, req).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        const session: UserSession = {
          id:    res.userId,
          name:  res.name,
          email: res.email,
          role:  res.role,
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(session));
        this.currentUserSubject.next(session);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): UserSession | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: RolUsuario): boolean {
    return this.getUser()?.role === role;
  }

  hasAnyRole(...roles: RolUsuario[]): boolean {
    const userRole = this.getUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}