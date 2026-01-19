// components/basket/basket.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BasketService } from '../services/basket.service';
import { OrderService } from '../services/order.service';
import { BasketItem } from '../models/order.model';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit {
  basketItems: BasketItem[] = [];
  tableNumber: string = '';
  customerName: string = '';
  basketCount: number = 0;
  isPlacingOrder: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private basketService: BasketService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.basketService.basketItems$.subscribe(items => {
      this.basketItems = items;
    });
    
    this.basketService.basketCount$.subscribe(count => {
      this.basketCount = count;
    });
  }

  getTotalAmount(): number {
    return this.basketService.getTotalAmount();
  }

  increaseQuantity(item: BasketItem): void {
    this.basketService.updateQuantity(item.menuItem.id, item.quantity + 1);
  }

  decreaseQuantity(item: BasketItem): void {
    this.basketService.updateQuantity(item.menuItem.id, item.quantity - 1);
  }

  removeItem(item: BasketItem): void {
    this.basketService.removeFromBasket(item.menuItem.id);
  }

  updateInstructions(item: BasketItem): void {
    this.basketService.updateSpecialInstructions(
      item.menuItem.id, 
      item.specialInstructions || ''
    );
  }

  placeOrder(): void {
    if (!this.tableNumber || this.basketItems.length === 0) {
      return;
    }

      this.isPlacingOrder = true;
  this.errorMessage = '';
  this.successMessage = '';

    const language = localStorage.getItem('selectedLanguage') || 'en';
    const order = this.orderService.createOrder(
      this.basketItems,
      this.tableNumber,
      this.customerName || 'Guest',
      language
    );


  const subscription = this.orderService.createOrder(
    this.basketItems,
    this.tableNumber.trim(),
    this.customerName.trim  () || 'Guest',
    language
  ).subscribe({
    next: (order) => {
      console.log('✅ Order created successfully:', order);
      this.successMessage = `Order ${order.orderNumber} placed successfully!`;
      
      // Clear basket
      this.basketService.clearBasket();
      
      // Navigate after short delay
      setTimeout(() => {
        this.router.navigate(['/order-status', order.orderNumber]);
      }, 1000);
    },
    error: (error) => {
      console.error('❌ Order creation failed:', error);
      this.isPlacingOrder = false;
      
      // Detailed error handling
      if (error.status === 0) {
        this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.status === 400) {
        this.errorMessage = error.error?.message || 'Invalid order data. Please check your items.';
      } else if (error.status === 404) {
        this.errorMessage = 'Some menu items are no longer available.';
      } else if (error.status === 500) {
        this.errorMessage = 'Server error. Please try again later.';
      } else {
        this.errorMessage = `Failed to place order: ${error.message}`;
      }
    },
    complete: () => {
      console.log('🏁 Order creation process completed');
    }
  });

    this.basketService.clearBasket();
    this.router.navigate(['/order-status']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}