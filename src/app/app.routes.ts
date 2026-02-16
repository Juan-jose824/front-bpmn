import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AnalysisMain } from './features/analisis/pages/analisis-main/analisis-main';
import { MainLayout } from './layout/main-layout/main-layout';
import { History } from './features/analisis/pages/history/history';
import { UserRegister } from './features/admin/pages/user-register/user-register';

export const routes: Routes = [

  // LOGIN (sin layout)
  { path: 'login', component: Login },

  // RUTAS CON LAYOUT
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'analisis', component: AnalysisMain },
      {path: 'history', component: History},
      {path: 'user-register', component: UserRegister}
    ]
  },

  // REDIRECCIÓN FINAL
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: 'login' }

];

