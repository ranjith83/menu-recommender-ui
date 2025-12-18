import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { 
  RecommendationRequest, 
  RecommendationResponse, 
  DietaryOption, 
  PreferenceOption 
} from '../models/menu-item.model';
import { RecommendationService } from '../services/recommendation.service';
import { BasketService } from '../services/basket.service';
import { OrderService } from '../services/order.service';
import { Language, Order } from '../models/order.model';
import { LanguageModalComponent } from '../language-modal.component/language-modal.component';

@Component({
  selector: 'app-menu-recommender',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, LanguageModalComponent],
  templateUrl: './menu-recommender.component.html',
  styleUrls: ['./menu-recommender.component.css']
})
export class MenuRecommenderComponent implements OnInit, AfterViewInit {
  query: string = '';
  selectedDietary: string[] = [];
  selectedPreferences: string[] = [];
  maxPrice: string = '';
  mealTime: string = '';
  weather: string = '';
  occasion: string = '';
  
  loading: boolean = false;
  recommendation: RecommendationResponse | null = null;
  showAdvanced: boolean = false;
  error: string | null = null;
  showLanguageModal: boolean = false;
  selectedLanguage: Language | null = null;
  basketCount: number = 0;
  currentOrder: Order | null = null;
  
  displayedItemsCount: number = 3;
  itemsPerPage: number = 3;
  currentCardIndex: number = 0;
  carouselScrollPosition: number = 0;
  itemsInBasket = new Map<number, number>();
  
  private robotAudio: HTMLAudioElement | null = null;
  private isBrowser: boolean;
  
  @ViewChild('carouselContainer', { static: false }) carouselContainer?: ElementRef;

  dietaryOptions: DietaryOption[] = [
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'halal', label: 'Halal', icon: '☪️' },
    { id: 'gluten-free', label: 'Gluten Free', icon: '🌾' },
    { id: 'dairy-free', label: 'Dairy Free', icon: '🥛' },
    { id: 'nut-free', label: 'Nut Free', icon: '🥜' }
  ];

  preferenceOptions: PreferenceOption[] = [
    { id: 'spicy', label: 'Spicy', icon: '🌶️' },
    { id: 'sweet', label: 'Sweet', icon: '🍯' },
    { id: 'healthy', label: 'Healthy', icon: '💚' },
    { id: 'protein-rich', label: 'Protein Rich', icon: '🥩' },
    { id: 'low-calorie', label: 'Low Calorie', icon: '⚖️' },
    { id: 'comfort-food', label: 'Comfort Food', icon: '🍲' }
  ];

  mealTimes: string[] = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Late Night'];
  weatherOptions: string[] = ['Sunny', 'Rainy', 'Cold', 'Hot', 'Mild'];
  occasions: string[] = ['Casual', 'Date Night', 'Family Meal', 'Business', 'Celebration', 'Quick Bite'];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private recommendationService: RecommendationService,
    private basketService: BasketService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Only initialize browser-specific features if we're in the browser
    if (this.isBrowser) {
      this.initRobotSound();
      this.loadSavedLanguage();
    }
    
    this.basketService.basketCount$.subscribe(count => {
      this.basketCount = count;
    });
    
    this.basketService.basketItems$.subscribe(items => {
      this.itemsInBasket.clear();
      items.forEach(item => {
        this.itemsInBasket.set(item.menuItem.id, item.quantity);
      });
    });
    
    this.orderService.currentUserOrder$.subscribe(order => {
      this.currentOrder = order;
    });
    
    this.orderService.loadCurrentUserOrder();
  }

  private loadSavedLanguage(): void {
    if (!this.isBrowser) {
      return;
    }
    
    try {
      const savedLangData = localStorage.getItem('userLanguage');
      if (savedLangData) {
        this.selectedLanguage = JSON.parse(savedLangData);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
      this.selectedLanguage = null;
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    
    // Only check carousel in browser
    if (this.isBrowser) {
      setTimeout(() => {
        this.checkCarouselScroll();
      }, 100);
    }
  }
  
  initRobotSound(): void {
    // Only initialize audio in browser
    if (this.isBrowser) {
      // Audio initialization if needed
    }
  }
  
  playRobotSound(): void {
    if (!this.isBrowser) {
      return;
    }
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error('Error playing robot sound:', error);
    }
  }

  getItemQuantity(itemId: number): number {
    return this.itemsInBasket.get(itemId) || 0;
  }

  isItemInBasket(itemId: number): boolean {
    return this.itemsInBasket.has(itemId) && this.itemsInBasket.get(itemId)! > 0;
  }

  incrementItem(item: any, event: Event): void {
    event.stopPropagation();
    this.basketService.addToBasket(item, 1);
    this.showQuickFeedback('Added to basket!');
  }

  decrementItem(itemId: number, event: Event): void {
    event.stopPropagation();
    const currentQty = this.getItemQuantity(itemId);
    if (currentQty > 0) {
      this.basketService.updateQuantity(itemId, currentQty - 1);
      if (currentQty === 1) {
        this.showQuickFeedback('Removed from basket');
      } else {
        this.showQuickFeedback('Quantity updated');
      }
    }
  }

  private showQuickFeedback(message: string): void {
    if (!this.isBrowser) {
      return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium';
    toast.style.animation = 'slideInRight 0.3s ease-out';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
  }

  toggleSelection(item: string, list: string[]): void {
    const index = list.indexOf(item);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(item);
    }
  }

  toggleDietary(item: string): void {
    this.toggleSelection(item, this.selectedDietary);
  }

  togglePreference(item: string): void {
    this.toggleSelection(item, this.selectedPreferences);
  }

  selectMealTime(time: string): void {
    this.mealTime = this.mealTime === time ? '' : time;
  }

  selectWeather(w: string): void {
    this.weather = this.weather === w ? '' : w;
  }

  selectOccasion(occ: string): void {
    this.occasion = this.occasion === occ ? '' : occ;
  }

  clearFilters(): void {
    this.selectedDietary = [];
    this.selectedPreferences = [];
    this.maxPrice = '';
    this.mealTime = '';
    this.weather = '';
    this.occasion = '';
    this.query = '';
    this.recommendation = null;
    this.error = null;
    this.displayedItemsCount = 3;
    this.currentCardIndex = 0;
    this.carouselScrollPosition = 0;
  }

  hasActiveFilters(): boolean {
    return this.selectedDietary.length > 0 || this.selectedPreferences.length > 0 || 
           this.maxPrice !== '' || this.mealTime !== '' || this.weather !== '' || this.occasion !== '';
  }

  buildEnhancedQuery(): string {
    let enhancedQuery = this.query;
    if (this.mealTime) enhancedQuery += ` for ${this.mealTime.toLowerCase()}`;
    if (this.weather) enhancedQuery += ` on a ${this.weather.toLowerCase()} day`;
    if (this.occasion) enhancedQuery += ` for a ${this.occasion.toLowerCase()}`;
    if (this.selectedPreferences.length > 0) {
      enhancedQuery += `. I prefer ${this.selectedPreferences.join(', ')} food`;
    }
    return enhancedQuery;
  }

  onSubmit(): void {
    if (!this.query.trim()) {
      this.error = 'Please enter what you\'re craving';
      return;
    }
    if (this.selectedLanguage) {
      this.getRecommendations();
    } else {
      this.showLanguageModal = true;
    }
  }

  onLanguageSelected(language: Language): void {
    this.selectedLanguage = language;
    this.showLanguageModal = false;
    this.getRecommendations();
  }

  onLanguageModalClosed(): void {
    this.showLanguageModal = false;
  }

  openLanguageModal(): void {
    this.showLanguageModal = true;
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  isSelected(item: string, list: string[]): boolean {
    return list.includes(item);
  }

  addToBasket(item: any): void {
    this.basketService.addToBasket(item, 1);
    this.showAddToBasketFeedback(item.name);
  }

  private showAddToBasketFeedback(itemName: string): void {
    if (!this.isBrowser) {
      return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span class="font-medium">${itemName} added to basket!</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  goToBasket(): void {
    this.router.navigate(['/basket']);
  }

  goToOrderStatus(): void {
    if (this.currentOrder) {
      this.router.navigate(['/order-status', this.currentOrder.id]);
    }
  }

  private checkCarouselScroll(): void {
    if (!this.isBrowser || !this.carouselContainer) {
      return;
    }
    
    const container = this.carouselContainer.nativeElement;
    this.carouselScrollPosition = container.scrollLeft;
    this.cdr.detectChanges();
  }

  scrollCarouselLeft(): void {
    if (!this.isBrowser || !this.carouselContainer) {
      return;
    }
    
    const container = this.carouselContainer.nativeElement;
    container.scrollBy({ left: -300, behavior: 'smooth' });
    setTimeout(() => this.checkCarouselScroll(), 350);
  }

  scrollCarouselRight(): void {
    if (!this.isBrowser || !this.carouselContainer) {
      return;
    }
    
    const container = this.carouselContainer.nativeElement;
    container.scrollBy({ left: 300, behavior: 'smooth' });
    setTimeout(() => this.checkCarouselScroll(), 350);
  }

  onCarouselScroll(): void {
    this.checkCarouselScroll();
  }

  hasMoreItemsToScroll(): boolean {
    if (!this.isBrowser || !this.carouselContainer || !this.recommendation?.matchedItems) {
      return false;
    }
    
    const container = this.carouselContainer.nativeElement;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    
    const hasMore = scrollLeft < (scrollWidth - clientWidth - 10);
    
    return hasMore;
  }

  private getRecommendations(): void {
    this.loading = true;
    this.error = null;
    const enhancedQuery = this.buildEnhancedQuery();
    const request: RecommendationRequest = {
      query: enhancedQuery,
      dietaryRestrictions: this.selectedDietary.length > 0 ? this.selectedDietary : undefined,
      maxPrice: this.maxPrice ? parseFloat(this.maxPrice) : undefined,
      topK: 5
    };
    this.recommendationService.getRecommendations(request).subscribe({
      next: (response) => {
        this.recommendation = response;
        this.displayedItemsCount = 3;
        this.currentCardIndex = 0;
        this.carouselScrollPosition = 0;
        this.loading = false;
        this.cdr.detectChanges();
        
        if (this.isBrowser) {
          setTimeout(() => {
            this.checkCarouselScroll();
          }, 100);
        }
      },
      error: (error) => {
        this.error = 'Sorry, there was an error getting recommendations. Please try again.';
        this.loading = false;
      }
    });
  }
}