import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './core/guards/auth.guard';

import { LoginComponent }            from './features/auth/login.component';
import { DashboardComponent }        from './features/dashboard/dashboard.component';
import { SolicitudListaComponent }   from './features/solicitudes/solicitud-lista.component';
import { SolicitudFormComponent }    from './features/solicitudes/solicitud-form.component';
import { SolicitudDetalleComponent } from './features/solicitudes/solicitud-detalle.component';
import { UsuariosComponent }         from './features/admin/usuarios.component';

const routes: Routes = [
  // Pública
  { path: 'login', component: LoginComponent },

  // Protegidas — requieren login
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard',         component: DashboardComponent },
      { path: 'solicitudes',       component: SolicitudListaComponent },
      { path: 'solicitudes/nueva', component: SolicitudFormComponent },
      { path: 'solicitudes/:id',   component: SolicitudDetalleComponent },
      // Solo ADMIN — RF-13
      {
        path: 'admin/usuarios',
        component: UsuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}