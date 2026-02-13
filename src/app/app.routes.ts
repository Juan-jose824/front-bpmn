import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AnalysisMain } from './features/analisis/pages/analisis-main/analisis-main';

export const routes: Routes = [
    { path: 'login', component: Login },
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'analisis', component: AnalysisMain },

];
