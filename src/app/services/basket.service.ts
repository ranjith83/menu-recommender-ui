import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BasketItem, MenuItem } from '../models/order.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private basketItems = new BehaviorSubject<BasketItem[]>([]);
  public basketItems$ = this.basketItems.asObservable();

  private basketCount = new BehaviorSubject<number>(0);
  public basketCount$ = this.basketCount.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only load from localStorage in browser environment
    if (this.isBrowser) {
      this.loadBasketFromStorage();
    }
  }

  private loadBasketFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const saved = localStorage.getItem('basket');
      if (saved) {
        const items = JSON.parse(saved);
        this.basketItems.next(items);
        this.updateBasketCount();
      }
    } catch (e) {
      console.error('Error loading basket:', e);
    }
  }

  private saveBasketToStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem('basket', JSON.stringify(this.basketItems.value));
      this.updateBasketCount();
    } catch (e) {
      console.error('Error saving basket:', e);
    }
  }

  private updateBasketCount(): void {
    const total = this.basketItems.value.reduce((sum, item) => sum + item.quantity, 0);
    this.basketCount.next(total);
  }

  addToBasket(menuItem: MenuItem, quantity: number = 1): void {
    const currentItems = this.basketItems.value;
    const existingIndex = currentItems.findIndex(item => item.menuItem.id === menuItem.id);

    if (existingIndex > -1) {
      currentItems[existingIndex].quantity += quantity;
    } else {
      currentItems.push({ menuItem, quantity });
    }

    this.basketItems.next([...currentItems]);
    this.saveBasketToStorage();
  }

  removeFromBasket(menuItemId: number): void {
    const currentItems = this.basketItems.value.filter(item => item.menuItem.id !== menuItemId);
    this.basketItems.next(currentItems);
    this.saveBasketToStorage();
  }

  updateQuantity(menuItemId: number, quantity: number): void {
    const currentItems = this.basketItems.value;
    const index = currentItems.findIndex(item => item.menuItem.id === menuItemId);
    
    if (index > -1) {
      if (quantity <= 0) {
        this.removeFromBasket(menuItemId);
      } else {
        currentItems[index].quantity = quantity;
        this.basketItems.next([...currentItems]);
        this.saveBasketToStorage();
      }
    }
  }

  updateSpecialInstructions(menuItemId: number, instructions: string): void {
    const currentItems = this.basketItems.value;
    const index = currentItems.findIndex(item => item.menuItem.id === menuItemId);
    
    if (index > -1) {
      currentItems[index].specialInstructions = instructions;
      this.basketItems.next([...currentItems]);
      this.saveBasketToStorage();
    }
  }

  getBasketItems(): BasketItem[] {
    return this.basketItems.value;
  }

  getTotalAmount(): number {
    return this.basketItems.value.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity);
    }, 0);
  }

  clearBasket(): void {
    this.basketItems.next([]);
    if (this.isBrowser) {
      try {
        localStorage.removeItem('basket');
      } catch (e) {
        console.error('Error clearing basket:', e);
      }
    }
    this.updateBasketCount();
  }

  getItemCount(): number {
    return this.basketCount.value;
  }
}