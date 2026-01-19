// components/order-status/order-status.component.ts - FIXED LOADING ISSUE

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { OrderService } from '../services/order.service';
import { Order, OrderStatus } from '../models/order.model';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.css']
})
export class OrderStatusComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  private orderSubscription?: Subscription;
  private refreshSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {
    console.log('🎬 OrderStatusComponent created');
  }

  ngOnInit(): void {
    console.log('🚀 OrderStatusComponent ngOnInit');
    
    // IMPORTANT: Subscribe to route params changes (not just snapshot)
    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');
      console.log('📍 Order ID from route:', orderId);
      
      if (orderId) {
        // Load specific order by ID
        this.loadOrder(orderId);
        
        // Clear old refresh subscription if exists
        this.refreshSubscription?.unsubscribe();
        
        // Set up auto-refresh only if order is not completed
        this.refreshSubscription = interval(5000).subscribe(() => {
          // Only refresh if order exists and is not completed
          if (this.order && !this.isOrderComplete(this.order.status)) {
            console.log('🔄 Auto-refreshing order status...');
            this.loadOrder(orderId);
          } else if (this.order && this.isOrderComplete(this.order.status)) {
            // Stop polling when order is complete
            console.log('✅ Order completed, stopping auto-refresh');
            this.refreshSubscription?.unsubscribe();
          }
        });
      } else {
        // No ID in route - load current user order
        console.log('📦 Loading current user order from service');
        this.orderService.loadCurrentUserOrder();
        
        this.orderSubscription = this.orderService.currentUserOrder$.subscribe(order => {
          console.log('📥 Current user order updated:', order?.orderNumber);
          this.order = order;
          this.loading = false;
          
          if (!order) {
            this.errorMessage = 'No active order found';
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    console.log('🧹 OrderStatusComponent destroyed - cleaning up');
    this.orderSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  loadOrder(orderId: string): void {
    // Show loading only on initial load
    const isInitialLoad = this.order === null;
    if (isInitialLoad) {
      this.loading = true;
    }
    
    console.log('🔍 Loading order:', orderId);
    
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        console.log('✅ Order loaded:', order.orderNumber, 'Status:', order.status);
        console.log('📦 Order object:', order);
        
        // CRITICAL: Set order BEFORE setting loading to false
        this.order = order;
        this.loading = false;
        this.errorMessage = '';
        
        // Stop polling if order is complete
        if (this.isOrderComplete(order.status)) {
          console.log('🛑 Order is complete, stopping refresh');
          this.refreshSubscription?.unsubscribe();
        }
      },
      error: (err) => {
        console.error('❌ Failed to load order:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Full error:', err);
        
        this.loading = false;
        
        if (err.status === 404) {
          this.errorMessage = 'Order not found';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Is the backend running?';
        } else {
          this.errorMessage = `Failed to load order: ${err.message}`;
        }
      }
    });
  }

  getStatusIndex(status: string): number {
    const statuses = ['Pending', 'Preparing', 'Ready', 'Delivering', 'Completed'];
    return statuses.indexOf(status);
  }

  getProgressPercentage(): number {
    if (!this.order) return 0;
    const index = this.getStatusIndex(this.order.status);
    return ((index + 1) / 5) * 100;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isOrderComplete(status: string): boolean {
    return status === 'Completed' || status === 'Cancelled';
  }

  goToMenu(): void {
    console.log('🔙 Navigating to menu');
    this.router.navigate(['/menu']);
  }

  startNewOrder(): void {
    console.log('🆕 Starting new order');
    this.orderService.clearCurrentUserOrder();
    this.router.navigate(['/menu']);
  }

  retryLoad(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loading = true;
      this.errorMessage = '';
      this.loadOrder(orderId);
    }
  }
}
