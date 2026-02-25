import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/authservice';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const token = auth.getToken();
  const isRefresh = req.url.includes('/api/refresh');
  const isLogin = req.url.includes('/api/login');

  const cloned = req.clone({
    withCredentials: true,
    ...((token && !isRefresh && !isLogin)
      ? { setHeaders: { Authorization: `Bearer ${token}` } }
      : {}),
  });

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        return throwError(() => err);
      }
      if (err.status === 403) {
        if (isRefresh || err.url?.includes('/api/refresh')) {
          auth.logout();
          return throwError(() => err);
        }
        return auth.refreshToken().pipe(
          switchMap(() => next(req.clone({
            withCredentials: true,
            setHeaders: { Authorization: `Bearer ${auth.getToken()}` },
          }))),
          catchError(() => {
            auth.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
