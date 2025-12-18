import { Routes } from '@angular/router';
import { MenuRecommenderComponent } from './menu-recommender.component/menu-recommender.component';
import { KitchenDashboardComponent } from './kitchen-dashboard.component/kitchen-dashboard.component';
import { KitchenLoginComponent } from './kitchen-login.component/kitchen-login.component';
import { OrderStatusComponent } from './order-status.component/order-status.component';
import { BasketComponent } from './basket.component/basket.component';
import { authGuard } from './guards/auth-guard';
import { RenderMode } from '@angular/ssr';

export const routes: Routes = [
  // Menu recommender as separate route
  {
    path: 'menu',
    component: MenuRecommenderComponent,
    title: 'Menu - AI-Powered Recommendations'
  },
  // Basket page
  {
    path: 'basket',
    component: BasketComponent,
    title: 'Your Basket - Menu Genius'
  },
  // Order status with ID
  /**{
    path: 'order-status/:id',
    component: OrderStatusComponent,
    title: 'Order Status - Menu Genius',
    renderMode: RenderMode.Client
  },**/
  // Order status without ID
  {
    path: 'order-status',
    component: OrderStatusComponent,
    title: 'Order Status - Menu Genius'
  },
  // Kitchen login
  {
    path: 'kitchen-login',
    component: KitchenLoginComponent,
    title: 'Kitchen Login - Menu Genius'
  },
  // Kitchen dashboard (protected)
  {
    path: 'kitchen',
    component: KitchenDashboardComponent,
    //canActivate: [authGuard],
    title: 'Kitchen Dashboard - Menu Genius'
  },
  // Root path - empty, will show landing page via AppComponent logic
  {
    path: '',
    pathMatch: 'full',
    children: []
  }
];