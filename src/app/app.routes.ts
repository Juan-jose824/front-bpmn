import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AnalysisMain } from './features/analisis/pages/analisis-main/analisis-main';
import { MainLayout } from './layout/main-layout/main-layout';
import { History } from './features/analisis/pages/history/history';
import { UserRegister } from './features/admin/pages/user-register/user-register';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  // LOGIN (sin layout, sin guard)
  { path: 'login', component: Login },

  // RUTAS CON LAYOUT — protegidas por JWT (si no hay token, redirige a /login)
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'analisis', component: AnalysisMain },
      { path: 'history', component: History },
      { path: 'user-register', component: UserRegister }
    ]
  },

  // REDIRECCIÓN FINAL
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: 'login' }

];

