import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../services/auth.service';
import { OrderManagementComponent } from '../order-management.component/order-management.component';
import { MenuManagementComponent } from '../menu-management.component/menu-management.component';

type DashboardView = 'orders' | 'menu';

@Component({
  selector: 'app-kitchen-dashboard',
  standalone: true,
  imports: [CommonModule, OrderManagementComponent, MenuManagementComponent],
  templateUrl: './kitchen-dashboard.component.html',
  styleUrls: ['./kitchen-dashboard.component.css']
})
export class KitchenDashboardComponent implements OnInit, OnDestroy {
  currentView: DashboardView = 'orders';
  currentUser: User | null = null;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check authentication
   /** this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/kitchen-login']);
      }
    });  

    if (!this.authService.canAccessKitchen()) {
      this.router.navigate(['/kitchen-login']);
      return;
    }  */
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  switchView(view: DashboardView): void {
    this.currentView = view;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/kitchen-login']);
  }

  canManageMenu(): boolean {
    return true; // this.currentUser?.role === 'admin' || this.currentUser?.role === 'kitchen';
  }
}