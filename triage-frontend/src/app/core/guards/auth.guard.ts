import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/solicitud.model';

// ── AuthGuard: protege todas las rutas que requieren autenticación ────────────
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}

// ── RoleGuard: restringe por rol específico (pasar en route.data.roles) ───────
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowed: RolUsuario[] = route.data['roles'] ?? [];
    const userRole = this.auth.getUser()?.role;
    if (userRole && allowed.includes(userRole)) return true;
    this.router.navigate(['/dashboard']);
    return false;
  }
}