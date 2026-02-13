import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AnalysisMain } from '../app/features/analysis/pages/analysis-main/analysis-main';

export const routes: Routes = [
    { path: 'login', component: Login },
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    // {path: 'login', component: LoginComponent },
    {path: 'analysis', component: AnalysisMain },
    // {path: 'registro-usuario', component: RegisterComponent },
    // {path: '**', redirectTo: 'login' }, 
];
