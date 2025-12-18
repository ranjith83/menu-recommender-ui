import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect kitchen routes
 * Redirects to login if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.canAccessKitchen()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  sessionStorage.setItem('redirect_url', state.url);
  
  // Redirect to login page
  router.navigate(['/kitchen-login']);
  return false;
};

/**
 * Guard to protect admin-only routes
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

  if (currentUser && currentUser.role === 'admin') {
    return true;
  }

  // Redirect to kitchen dashboard or login
  if (authService.isAuthenticated()) {
    router.navigate(['/kitchen']);
  } else {
    router.navigate(['/kitchen-login']);
  }
  
  return false;
};

/**
 * Guard to check specific permissions
 */
export const permissionGuard = (permission: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasPermission(permission)) {
      return true;
    }

    // Redirect based on authentication status
    if (authService.isAuthenticated()) {
      router.navigate(['/kitchen'], { 
        queryParams: { error: 'insufficient_permissions' } 
      });
    } else {
      router.navigate(['/kitchen-login']);
    }
    
    return false;
  };
};