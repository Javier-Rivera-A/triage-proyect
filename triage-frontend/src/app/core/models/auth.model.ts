import { RolUsuario } from './solicitud.model';
 
/** backend: LoginRequest */
export interface LoginRequest {
  email: string;
  password: string;
}
 
/** backend: AuthResponse */
export interface LoginResponse {
  token: string;
  type: string;
  userId: number;
  name: string;
  email: string;
  role: RolUsuario;
}
 
/** Perfil simplificado que se guarda en localStorage */
export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: RolUsuario;
}
 