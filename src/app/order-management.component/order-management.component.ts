import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subscription, interval } from 'rxjs';
import { OrderService } from '../services/order.service';
import { Order, OrderStatus } from '../models/order.model';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css']
})
export class OrderManagementComponent implements OnInit, OnDestroy {
  activeOrders: Order[] = [];
  private orderSubscription?: Subscription;
  private refreshSubscription?: Subscription;
  activeOrders$!: Observable<Order[]>;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    
    // Subscribe to order updates
    this.orderSubscription = this.orderService.orders$.subscribe(orders => {
      this.activeOrders = orders.filter(o => 
        o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED
      );
    });

    // Refresh every 5 seconds
    this.refreshSubscription = interval(5000).subscribe(() => {
      this.loadOrders();
    });
  }

  ngOnDestroy(): void {
    this.orderSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  loadOrders(): void {
    this.activeOrders$ = this.orderService.getActiveOrders();
   // this.orderService.getActiveOrders();
  }

  updateStatus(orderId: string, status: string): void {
    this.orderService.updateOrderStatus(orderId, status as OrderStatus);
  }

  getOrdersByStatus(status: string): Order[] {
    return this.activeOrders.filter(o => o.status === status);
  }

  getTimeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }
}