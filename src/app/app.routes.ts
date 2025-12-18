import { Routes } from '@angular/router';
import { MenuRecommenderComponent } from './menu-recommender.component/menu-recommender.component';
import { KitchenDashboardComponent } from './kitchen-dashboard.component/kitchen-dashboard.component';
import { KitchenLoginComponent } from './kitchen-login.component/kitchen-login.component';
import { OrderStatusComponent } from './order-status.component/order-status.component';
import { BasketComponent } from './basket.component/basket.component';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Menu recommender - Client-side only due to browser APIs
  {
    path: 'menu',
    component: MenuRecommenderComponent,
    title: 'Menu - AI-Powered Recommendations'
  },
  
  // Root path
  {
    path: '',
    pathMatch: 'full',
    children: []
  }
];