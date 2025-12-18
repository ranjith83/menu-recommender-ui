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

    const language = localStorage.getItem('selectedLanguage') || 'en';
    const order = this.orderService.createOrder(
      this.basketItems,
      this.tableNumber,
      this.customerName || 'Guest',
      language
    );

    this.basketService.clearBasket();
    this.router.navigate(['/order-status', order.id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}