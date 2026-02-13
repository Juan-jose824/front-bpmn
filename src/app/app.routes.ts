import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AnalysisMain } from './features/analisis/pages/analisis-main/analisis-main';

export const routes: Routes = [
    { path: 'login', component: Login },
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    // {path: 'login', component: LoginComponent },
    {path: 'analisis', component: AnalysisMain },
    // {path: 'registro-usuario', component: RegisterComponent },
    // {path: '**', redirectTo: 'login' }, 
];
