import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor to add authentication token to requests
 * and handle authentication errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get current user
  const currentUser = authService.getCurrentUser();

  // Clone request and add authorization header if user is authenticated
  if (currentUser) {
    // In production, you would get the actual token from storage
    const token = sessionStorage.getItem('kitchen_auth_token');
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'X-User-Id': currentUser.id,
          'X-User-Role': currentUser.role
        }
      });
    }
  }

  // Handle the request and catch authentication errors
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Unauthorized - logout and redirect to login
        console.error('Authentication error: Unauthorized');
        authService.logout();
        router.navigate(['/kitchen-login'], {
          queryParams: { error: 'session_expired' }
        });
      } else if (error.status === 403) {
        // Forbidden - insufficient permissions
        console.error('Authorization error: Forbidden');
        router.navigate(['/kitchen'], {
          queryParams: { error: 'insufficient_permissions' }
        });
      }
      
      return throwError(() => error);
    })
  );
};