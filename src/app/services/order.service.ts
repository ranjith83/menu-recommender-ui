// services/order.service.ts - FIXED POLLING VERSION

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, throwError, Subscription } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Order, OrderStatus, BasketItem, MenuItem } from '../models/order.model';
import { environment } from '../../environments/environment';

// ... Keep all your interfaces (ApiResponse, OrderResponseDto, etc.)
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

interface OrderResponseDto {
  id: number;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  language: string;
  totalAmount: number;
  serviceCharge: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
  items: OrderItemDto[];
  createdBy?: UserSummaryDto;
}

interface OrderItemDto {
  id: number;
  menuItemId: number;
  menuItemName: string;
  menuItemDescription?: string;
  price: number;
  quantity: number;
  subtotal: number;
  specialInstructions?: string;
}

interface UserSummaryDto {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

interface CreateOrderRequest {
  tableNumber: string;
  customerName: string;
  language: string;
  notes?: string;
  items: {
    menuItemId: number;
    quantity: number;
    specialInstructions?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;
  private isBrowser: boolean;

  // Observables for order state
  private currentUserOrder = new BehaviorSubject<Order | null>(null);
  public currentUserOrder$ = this.currentUserOrder.asObservable();

  private orders = new BehaviorSubject<Order[]>([]);
  public orders$ = this.orders.asObservable();

  // ⚠️ REMOVED: Global polling subscription
  // This was causing the infinite reload issue
  // private pollingSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Load current order from localStorage on init
      this.loadCurrentOrderFromStorage();

      // ❌ REMOVED: Global polling that was causing infinite reloads
      // The component will handle its own polling now
      /*
      interval(5000).pipe(
        switchMap(() => {
          const currentOrder = this.currentUserOrder.value;
          if (currentOrder && !this.isOrderComplete(currentOrder.status)) {
            return this.refreshOrderStatus(currentOrder.id);
          }
          return [];
        })
      ).subscribe({
        error: (err) => console.error('Error refreshing order:', err)
      });
      */
    }
  }

  /**
   * Create a new order (calls backend API)
   */
  createOrder(
    items: BasketItem[],
    tableNumber: string,
    customerName: string = 'Guest',
    language: string = 'en'
  ): Observable<Order> {
    const request: CreateOrderRequest = {
      tableNumber,
      customerName,
      language,
      items: items.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || ''
      }))
    };

    console.log('📤 Creating order:', request);

    return this.http.post<ApiResponse<OrderResponseDto>>(this.apiUrl, request).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create order');
        }
        return this.mapDtoToOrder(response.data);
      }),
      tap(order => {
        // Save as current user order
        this.currentUserOrder.next(order);
        this.saveCurrentOrderToStorage(order);
        
        console.log('✅ Order created successfully:', order.orderNumber);
      }),
      catchError(error => {
        console.error('❌ Error creating order:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get order by ID (handles both numeric IDs and order numbers)
   */
  getOrderById(orderId: string): Observable<Order> {
    const url = orderId.startsWith('ORD-')
      ? `${this.apiUrl}/by-number/${orderId}`
      : `${this.apiUrl}/${orderId}`;

    return this.http.get<ApiResponse<OrderResponseDto>>(url).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Order not found');
        }
        return this.mapDtoToOrder(response.data);
      }),
      catchError(error => {
        console.error('❌ Error fetching order:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get order by order number (no auth required)
   */
  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<ApiResponse<OrderResponseDto>>(`${this.apiUrl}/by-number/${orderNumber}`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Order not found');
        }
        return this.mapDtoToOrder(response.data);
      }),
      catchError(error => {
        console.error('❌ Error fetching order by number:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get active orders (requires auth)
   */
  getActiveOrders(): Observable<Order[]> {
    return this.http.get<ApiResponse<OrderResponseDto[]>>(`${this.apiUrl}/active`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          return [];
        }
        return response.data.map(dto => this.mapDtoToOrder(dto));
      }),
      tap(orders => this.orders.next(orders)),
      catchError(error => {
        console.error('❌ Error fetching active orders:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all orders with filters (requires auth)
   */
  getAllOrders(
    status?: OrderStatus,
    tableNumber?: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Observable<Order[]> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (status !== undefined) {
      const statusValue = Object.values(OrderStatus).indexOf(status);
      params = params.set('status', statusValue.toString());
    }
    if (tableNumber) {
      params = params.set('tableNumber', tableNumber);
    }

    return this.http.get<ApiResponse<OrderResponseDto[]>>(this.apiUrl, { params }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          return [];
        }
        return response.data.map(dto => this.mapDtoToOrder(dto));
      }),
      tap(orders => this.orders.next(orders)),
      catchError(error => {
        console.error('❌ Error fetching orders:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update order status (requires auth)
   */
  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Observable<Order> {
    const statusValue = Object.values(OrderStatus).indexOf(status);
    const url = orderId.startsWith('ORD-')
      ? `${this.apiUrl}/by-number/${orderId}/status`
      : `${this.apiUrl}/${orderId}/status`;

    return this.http.patch<ApiResponse<OrderResponseDto>>(url, { status: statusValue, notes }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update order status');
        }
        return this.mapDtoToOrder(response.data);
      }),
      tap(order => {
        // Update current order if it matches
        const currentOrder = this.currentUserOrder.value;
        if (currentOrder && (currentOrder.id === orderId || currentOrder.orderNumber === orderId)) {
          this.currentUserOrder.next(order);
          this.saveCurrentOrderToStorage(order);
        }
      }),
      catchError(error => {
        console.error('❌ Error updating order status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Load current order from localStorage
   */
  loadCurrentOrderFromStorage(): void {
    if (!this.isBrowser) return;

    try {
      const saved = localStorage.getItem('currentUserOrder');
      if (saved) {
        const order = JSON.parse(saved);
        const parsedOrder: Order = {
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          completedAt: order.completedAt ? new Date(order.completedAt) : undefined
        };
        
        this.currentUserOrder.next(parsedOrder);
        console.log('📦 Loaded order from localStorage:', parsedOrder.orderNumber);
      }
    } catch (e) {
      console.error('❌ Error loading current order from storage:', e);
    }
  }

  /**
   * Save current order to localStorage (for caching only)
   */
  private saveCurrentOrderToStorage(order: Order): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem('currentUserOrder', JSON.stringify(order));
      console.log('💾 Saved order to localStorage:', order.orderNumber);
    } catch (e) {
      console.error('❌ Error saving current order to storage:', e);
    }
  }

  /**
   * Clear current user order
   */
  clearCurrentUserOrder(): void {
    this.currentUserOrder.next(null);
    
    if (this.isBrowser) {
      try {
        localStorage.removeItem('currentUserOrder');
        console.log('🗑️ Cleared current order from localStorage');
      } catch (e) {
        console.error('❌ Error clearing current order:', e);
      }
    }
  }

  /**
   * Load current user order (called from components)
   */
  loadCurrentUserOrder(): void {
    this.loadCurrentOrderFromStorage();
  }

  /**
   * Get pending orders (for backward compatibility)
   */
  getPendingOrders(): Observable<Order[]> {
    return this.getAllOrders(OrderStatus.PENDING);
  }

  /**
   * Check if order is complete
   */
  private isOrderComplete(status: OrderStatus | string): boolean {
    return status === OrderStatus.COMPLETED || 
           status === OrderStatus.CANCELLED ||
           status === 'Completed' || 
           status === 'Cancelled';
  }

  /**
   * Map DTO to Order model (properly typed with BasketItem[])
   */
  private mapDtoToOrder(dto: OrderResponseDto): Order {
    return {
      id: dto.orderNumber,
      orderNumber: dto.orderNumber,
      tableNumber: dto.tableNumber,
      customerName: dto.customerName,
      language: dto.language,
      totalAmount: dto.finalAmount,
      serviceCharge: dto.serviceCharge,
      status: dto.status as OrderStatus,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
      notes: dto.notes,
      createdBy: dto.createdBy,
      items: dto.items.map(item => this.mapToBasketItem(item))
    };
  }

  /**
   * Map API item DTO to BasketItem (matches your Order model exactly)
   */
  private mapToBasketItem(item: OrderItemDto): BasketItem {
    const menuItem: MenuItem = {
      id: item.menuItemId,
      name: item.menuItemName,
      description: item.menuItemDescription || '',
      price: item.price,
      category: '',
      cuisine: '',
      ingredients: [],
      dietaryTags: [],
      spiceLevel: '',
      calories: 0,
      imageUrl: '',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return {
      menuItem,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions || ''
    };
  }
}