import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { OrderService } from '../services/order.service';
import { Order,OrderStatus } from '../models/order.model';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CommonModule],
    templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.css']
 
})
export class OrderStatusComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  private orderSubscription?: Subscription;
  private refreshSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    
    if (orderId) {
      this.loadOrder(orderId);
      
      // Subscribe to order updates
      this.orderSubscription = this.orderService.currentUserOrder$.subscribe(order => {
        if (order && order.id === orderId) {
          this.order = order;
        }
      });

      // Refresh every 3 seconds
      this.refreshSubscription = interval(3000).subscribe(() => {
        this.loadOrder(orderId);
      });
    } else {
      // Load current user order
      this.orderService.loadCurrentUserOrder();
      this.orderSubscription = this.orderService.currentUserOrder$.subscribe(order => {
        this.order = order;
      });
    }
  }

  ngOnDestroy(): void {
    this.orderSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  loadOrder(orderId: string): void {
    const order = this.orderService.getOrderById(orderId);
    if (order) {
      this.order = order;
    }
  }

  getStatusIndex(status: string): number {
    const statuses = ['Pending', 'Preparing', 'Ready', 'Delivering', 'Completed'];
    return statuses.indexOf(status);
  }

  getProgressPercentage(): number {
    const index = this.getStatusIndex(this.order?.status || '');
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

  goToMenu(): void {
    this.router.navigate(['/menu']);
  }

  startNewOrder(): void {
    this.orderService.clearCurrentUserOrder();
    this.router.navigate(['/']);
  }
}