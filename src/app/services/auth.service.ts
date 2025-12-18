import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'kitchen' | 'staff';
  email?: string;
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

interface StoredUser {
  username: string;
  password: string;
  fullName: string;
  role: 'admin' | 'kitchen' | 'staff';
  email?: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly STORAGE_KEY = 'kitchen_auth_user';
  private readonly SESSION_KEY = 'kitchen_auth_session';
  
  // Demo users database (in production, this would be in a real database)
  private users: Map<string, StoredUser> = new Map([
    ['admin', {
      username: 'admin',
      password: 'admin123', // In production, this would be hashed
      fullName: 'Admin User',
      role: 'admin',
      email: 'admin@menugenius.com',
      permissions: ['view_orders', 'manage_orders', 'view_menu', 'manage_menu', 'view_staff', 'manage_staff']
    }],
    ['kitchen', {
      username: 'kitchen',
      password: 'kitchen123',
      fullName: 'Kitchen Manager',
      role: 'kitchen',
      email: 'kitchen@menugenius.com',
      permissions: ['view_orders', 'manage_orders', 'view_menu', 'manage_menu']
    }],
    ['staff', {
      username: 'staff',
      password: 'staff123',
      fullName: 'Staff Member',
      role: 'staff',
      email: 'staff@menugenius.com',
      permissions: ['view_orders', 'manage_orders']
    }]
  ]);

  // Session management
  private sessionTimeout: any;
  private readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
private isBrowser: boolean;
constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  this.isBrowser = isPlatformBrowser(this.platformId);
  
  if (this.isBrowser) {
    this.loadUserFromStorage();
    this.startSessionMonitoring();
  }
}
  /**
   * Authenticate user with username and password
   */
  login(username: string, password: string): LoginResponse {
    try {
      // Input validation
      if (!username || !password) {
        return {
          success: false,
          message: 'Username and password are required'
        };
      }

      // Trim inputs
      username = username.trim().toLowerCase();
      password = password.trim();

      // Check if user exists
      const storedUser = this.users.get(username);
      
      if (!storedUser) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Verify password
      if (storedUser.password !== password) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Create user session
      const user: User = {
        id: this.generateUserId(),
        username: storedUser.username,
        fullName: storedUser.fullName,
        role: storedUser.role,
        email: storedUser.email,
        permissions: storedUser.permissions,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Generate session token
      const token = this.generateSessionToken(user);

      // Store session
      this.storeSession(user, token);

      // Update current user
      this.currentUserSubject.next(user);

      // Reset session timeout
      this.resetSessionTimeout();

      return {
        success: true,
        message: 'Login successful',
        user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.'
      };
    }
  }

  /**
   * Login async version
   */
  async loginAsync(username: string, password: string): Promise<LoginResponse> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const result = this.login(username, password);
        resolve(result);
      }, 500);
    });
  }

  /**
   * Logout current user
   */
  logout(): void {
    // Clear session
    this.clearSession();

    // Clear current user
    this.currentUserSubject.next(null);

    // Clear session timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
  }

  /**
   * Logout async version
   */
  async logoutAsync(): Promise<void> {
    return new Promise((resolve) => {
      this.logout();
      resolve();
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Check if user can access kitchen dashboard
   */
  canAccessKitchen(): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && ['admin', 'kitchen', 'staff'].includes(user.role);
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions.includes(permission) ?? false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user as observable
   */
  getCurrentUser$(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Register new user (admin only)
   */
  registerUser(userData: {
    username: string;
    password: string;
    fullName: string;
    role: 'admin' | 'kitchen' | 'staff';
    email?: string;
  }): LoginResponse {
    const currentUser = this.getCurrentUser();
    
    // Check if current user is admin
    if (!currentUser || currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Only administrators can register new users'
      };
    }

    // Validate inputs
    if (!userData.username || !userData.password || !userData.fullName) {
      return {
        success: false,
        message: 'All required fields must be filled'
      };
    }

    const username = userData.username.trim().toLowerCase();

    // Check if user already exists
    if (this.users.has(username)) {
      return {
        success: false,
        message: 'Username already exists'
      };
    }

    // Set permissions based on role
    let permissions: string[] = [];
    switch (userData.role) {
      case 'admin':
        permissions = ['view_orders', 'manage_orders', 'view_menu', 'manage_menu', 'view_staff', 'manage_staff'];
        break;
      case 'kitchen':
        permissions = ['view_orders', 'manage_orders', 'view_menu', 'manage_menu'];
        break;
      case 'staff':
        permissions = ['view_orders', 'manage_orders'];
        break;
    }

    // Create new user
    const newUser: StoredUser = {
      username,
      password: userData.password, // In production, hash this
      fullName: userData.fullName,
      role: userData.role,
      email: userData.email,
      permissions
    };

    // Store user
    this.users.set(username, newUser);

    // In production, save to database
    this.saveUsersToStorage();

    return {
      success: true,
      message: 'User registered successfully'
    };
  }

  /**
   * Register user async version
   */
  async registerUserAsync(userData: {
    username: string;
    password: string;
    fullName: string;
    role: 'admin' | 'kitchen' | 'staff';
    email?: string;
  }): Promise<LoginResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.registerUser(userData);
        resolve(result);
      }, 500);
    });
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): LoginResponse {
    const user = this.getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    const storedUser = this.users.get(user.username);
    
    if (!storedUser) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Verify current password
    if (storedUser.password !== currentPassword) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }

    // Validate new password
    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters'
      };
    }

    // Update password
    storedUser.password = newPassword;
    this.users.set(user.username, storedUser);
    this.saveUsersToStorage();

    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  /**
   * Change password async version
   */
  async changePasswordAsync(currentPassword: string, newPassword: string): Promise<LoginResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.changePassword(currentPassword, newPassword);
        resolve(result);
      }, 500);
    });
  }

  /**
   * Get all users (admin only)
   */
  getAllUsers(): User[] | null {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return null;
    }

    return Array.from(this.users.values()).map(storedUser => ({
      id: this.generateUserId(),
      username: storedUser.username,
      fullName: storedUser.fullName,
      role: storedUser.role,
      email: storedUser.email,
      permissions: storedUser.permissions,
      createdAt: new Date()
    }));
  }

  /**
   * Get all users async version
   */
  async getAllUsersAsync(): Promise<User[] | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.getAllUsers();
        resolve(result);
      }, 300);
    });
  }

  /**
   * Delete user (admin only)
   */
  deleteUser(username: string): LoginResponse {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Only administrators can delete users'
      };
    }

    // Prevent deleting yourself
    if (username === currentUser.username) {
      return {
        success: false,
        message: 'You cannot delete your own account'
      };
    }

    // Check if user exists
    if (!this.users.has(username)) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Delete user
    this.users.delete(username);
    this.saveUsersToStorage();

    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  /**
   * Update user role (admin only)
   */
  updateUserRole(username: string, newRole: 'admin' | 'kitchen' | 'staff'): LoginResponse {
    const currentUser = this.getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Only administrators can update user roles'
      };
    }

    const user = this.users.get(username);
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Update role
    user.role = newRole;

    // Update permissions based on new role
    switch (newRole) {
      case 'admin':
        user.permissions = ['view_orders', 'manage_orders', 'view_menu', 'manage_menu', 'view_staff', 'manage_staff'];
        break;
      case 'kitchen':
        user.permissions = ['view_orders', 'manage_orders', 'view_menu', 'manage_menu'];
        break;
      case 'staff':
        user.permissions = ['view_orders', 'manage_orders'];
        break;
    }

    this.users.set(username, user);
    this.saveUsersToStorage();

    return {
      success: true,
      message: 'User role updated successfully'
    };
  }

  /**
   * Refresh session
   */
  refreshSession(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.resetSessionTimeout();
    }
  }

  // Private helper methods

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionToken(user: User): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${user.username}_${timestamp}_${random}`;
  }

  private storeSession(user: User, token: string): void {
    const session = {
      user,
      token,
      expiresAt: Date.now() + this.SESSION_DURATION
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  private loadUserFromStorage(): void {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Check if session is expired
        if (session.expiresAt && Date.now() < session.expiresAt) {
          this.currentUserSubject.next(session.user);
          this.resetSessionTimeout();
          return;
        }
      }

      // Try localStorage as fallback
      const userData = localStorage.getItem(this.STORAGE_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.resetSessionTimeout();
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      this.clearSession();
    }
  }

  private clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  private resetSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      console.log('Session expired');
      this.logout();
    }, this.SESSION_DURATION);
  }

  private startSessionMonitoring(): void {
    // Monitor user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        if (this.isAuthenticated()) {
          this.resetSessionTimeout();
        }
      }, { passive: true });
    });
  }

  private saveUsersToStorage(): void {
    // In production, this would save to a database
    // For demo purposes, we keep users in memory only
    console.log('Users updated in memory');
  }

  /**
   * Get session time remaining (in milliseconds)
   */
  getSessionTimeRemaining(): number {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.expiresAt) {
          return Math.max(0, session.expiresAt - Date.now());
        }
      }
    } catch (error) {
      console.error('Error getting session time:', error);
    }
    return 0;
  }

  /**
   * Check if session is about to expire (less than 5 minutes)
   */
  isSessionAboutToExpire(): boolean {
    const remaining = this.getSessionTimeRemaining();
    return remaining > 0 && remaining < 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Extend session
   */
  extendSession(): void {
    const user = this.getCurrentUser();
    if (user) {
      const token = this.generateSessionToken(user);
      this.storeSession(user, token);
      this.resetSessionTimeout();
    }
  }
}