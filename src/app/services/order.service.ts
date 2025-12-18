import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { Order, OrderStatus, BasketItem } from '../models/order.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders = new BehaviorSubject<Order[]>([]);
  public orders$ = this.orders.asObservable();

  private currentUserOrder = new BehaviorSubject<Order | null>(null);
  public currentUserOrder$ = this.currentUserOrder.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only access localStorage in browser environment
    if (this.isBrowser) {
      this.loadOrdersFromStorage();
      
      // Simulate real-time updates every 30 seconds
      interval(30000).subscribe(() => {
        this.simulateOrderUpdates();
      });
    }
  }

  private loadOrdersFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const saved = localStorage.getItem('orders');
      if (saved) {
        const orders = JSON.parse(saved);
        this.orders.next(orders.map((o: any) => ({
          ...o,
          createdAt: new Date(o.createdAt),
          updatedAt: new Date(o.updatedAt)
        })));
      }
    } catch (e) {
      console.error('Error loading orders:', e);
    }
  }

  private saveOrdersToStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem('orders', JSON.stringify(this.orders.value));
    } catch (e) {
      console.error('Error saving orders:', e);
    }
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  createOrder(
    items: BasketItem[], 
    tableNumber: string, 
    customerName: string = 'Guest',
    language: string = 'en'
  ): Order {
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity);
    }, 0);

    const newOrder: Order = {
      id: this.generateOrderId(),
      tableNumber,
      items,
      totalAmount,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerName,
      language
    };

    const currentOrders = this.orders.value;
    currentOrders.push(newOrder);
    this.orders.next([...currentOrders]);
    this.saveOrdersToStorage();

    // Set as current user order
    this.currentUserOrder.next(newOrder);
    if (this.isBrowser) {
      try {
        localStorage.setItem('currentUserOrder', JSON.stringify(newOrder));
      } catch (e) {
        console.error('Error saving current user order:', e);
      }
    }

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const currentOrders = this.orders.value;
    const index = currentOrders.findIndex(o => o.id === orderId);
    
    if (index > -1) {
      currentOrders[index].status = status;
      currentOrders[index].updatedAt = new Date();
      this.orders.next([...currentOrders]);
      this.saveOrdersToStorage();

      // Update current user order if it's the same
      const currentUserOrder = this.currentUserOrder.value;
      if (currentUserOrder && currentUserOrder.id === orderId) {
        this.currentUserOrder.next(currentOrders[index]);
        if (this.isBrowser) {
          try {
            localStorage.setItem('currentUserOrder', JSON.stringify(currentOrders[index]));
          } catch (e) {
            console.error('Error updating current user order:', e);
          }
        }
      }
    }
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders.value.find(o => o.id === orderId);
  }

  getAllOrders(): Order[] {
    return this.orders.value;
  }

  getPendingOrders(): Order[] {
    return this.orders.value.filter(o => o.status === OrderStatus.PENDING);
  }

  getActiveOrders(): Order[] {
    return this.orders.value.filter(o => 
      o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED
    );
  }

  loadCurrentUserOrder(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const saved = localStorage.getItem('currentUserOrder');
      if (saved) {
        const order = JSON.parse(saved);
        this.currentUserOrder.next({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt)
        });
      }
    } catch (e) {
      console.error('Error loading current user order:', e);
    }
  }

  clearCurrentUserOrder(): void {
    this.currentUserOrder.next(null);
    if (this.isBrowser) {
      try {
        localStorage.removeItem('currentUserOrder');
      } catch (e) {
        console.error('Error clearing current user order:', e);
      }
    }
  }

  private simulateOrderUpdates(): void {
    if (!this.isBrowser) {
      return;
    }

    // Simulate automatic order status progression for demo
    const currentOrders = this.orders.value;
    let updated = false;

    currentOrders.forEach(order => {
      const timeSinceUpdate = Date.now() - new Date(order.updatedAt).getTime();
      const minutesSinceUpdate = timeSinceUpdate / (1000 * 60);

      // Auto-progress orders for demo purposes
      if (order.status === OrderStatus.PENDING && minutesSinceUpdate > 2) {
        order.status = OrderStatus.PREPARING;
        order.updatedAt = new Date();
        updated = true;
      } else if (order.status === OrderStatus.PREPARING && minutesSinceUpdate > 5) {
        order.status = OrderStatus.READY;
        order.updatedAt = new Date();
        updated = true;
      }
    });

    if (updated) {
      this.orders.next([...currentOrders]);
      this.saveOrdersToStorage();
    }
  }
}