import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { 
  RecommendationRequest, 
  RecommendationResponse, 
  DietaryOption, 
  PreferenceOption 
} from '../models/menu-item.model';
import { RecommendationService } from '../services/recommendation.service';

@Component({
  selector: 'app-menu-recommender',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './menu-recommender.component.html',
  styleUrls: ['./menu-recommender.component.css']
})
export class MenuRecommenderComponent implements OnInit {
  // Form state
  query: string = '';
  selectedDietary: string[] = [];
  selectedPreferences: string[] = [];
  maxPrice: string = '';
  mealTime: string = '';
  weather: string = '';
  occasion: string = '';
  
  // UI state
  loading: boolean = false;
  recommendation: RecommendationResponse | null = null;
  showAdvanced: boolean = false;
  error: string | null = null;
  
  // Pagination state
  displayedItemsCount: number = 3;
  itemsPerPage: number = 3;
  
  // Carousel state
  currentCardIndex: number = 0;
  carouselScrollPosition: number = 0;
  
  // Audio for robot
  private robotAudio: HTMLAudioElement | null = null;
  
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  // Options
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

  constructor(private recommendationService: RecommendationService) {}

  ngOnInit(): void {
    console.log('MenuRecommenderComponent initialized');
    // Initialize robot sound
    this.initRobotSound();
  }
  
  initRobotSound(): void {
    // Create a simple beep sound using Web Audio API
    // This creates a robot-like beep without external files
  }
  
  playRobotSound(): void {
    // Create Web Audio API context for robot sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Robot beep sound configuration
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
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
    return this.selectedDietary.length > 0 ||
           this.selectedPreferences.length > 0 ||
           this.maxPrice !== '' ||
           this.mealTime !== '' ||
           this.weather !== '' ||
           this.occasion !== '';
  }

  buildEnhancedQuery(): string {
    let enhancedQuery = this.query;
    
    if (this.mealTime) {
      enhancedQuery += ` for ${this.mealTime.toLowerCase()}`;
    }
    
    if (this.weather) {
      enhancedQuery += ` on a ${this.weather.toLowerCase()} day`;
    }
    
    if (this.occasion) {
      enhancedQuery += ` for a ${this.occasion.toLowerCase()}`;
    }
    
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
        console.log('Received recommendations:', response);
        this.recommendation = response;
        this.displayedItemsCount = 3;
        this.currentCardIndex = 0;
        this.carouselScrollPosition = 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error getting recommendations:', error);
        this.error = 'Sorry, there was an error getting recommendations. Please try again.';
        this.loading = false;
      }
    });
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  isSelected(item: string, list: string[]): boolean {
    return list.includes(item);
  }

  // Pagination Methods
  
  // Get currently displayed items
  getDisplayedItems(): any[] {
    if (!this.recommendation || !this.recommendation.matchedItems) {
      return [];
    }
    return this.recommendation.matchedItems.slice(0, this.displayedItemsCount);
  }

  // Check if there are more items to show
  hasMoreItems(): boolean {
    if (!this.recommendation || !this.recommendation.matchedItems) {
      return false;
    }
    return this.displayedItemsCount < this.recommendation.matchedItems.length;
  }

  // Load more items
  loadMore(): void {
    if (this.hasMoreItems()) {
      this.displayedItemsCount += this.itemsPerPage;
    }
  }

  // Get remaining items count
  getRemainingItemsCount(): number {
    if (!this.recommendation || !this.recommendation.matchedItems) {
      return 0;
    }
    const remaining = this.recommendation.matchedItems.length - this.displayedItemsCount;
    return Math.max(0, remaining);
  }
  
  // Carousel Navigation Methods
  nextCard(): void {
    if (this.recommendation && this.recommendation.matchedItems) {
      if (this.currentCardIndex < this.recommendation.matchedItems.length - 1) {
        this.currentCardIndex++;
      }
    }
  }
  
  previousCard(): void {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
    }
  }
  
  goToCard(index: number): void {
    this.currentCardIndex = index;
  }
  
  // Netflix-style Carousel Methods
  scrollCarouselLeft(): void {
    if (this.carouselContainer) {
      const container = this.carouselContainer.nativeElement;
      const scrollAmount = 300; // Scroll by ~one card width
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }
  
  scrollCarouselRight(): void {
    if (this.carouselContainer) {
      const container = this.carouselContainer.nativeElement;
      const scrollAmount = 300; // Scroll by ~one card width
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
  
  onCarouselScroll(): void {
    if (this.carouselContainer) {
      this.carouselScrollPosition = this.carouselContainer.nativeElement.scrollLeft;
    }
  }
  
  hasMoreItemsToScroll(): boolean {
    if (!this.carouselContainer || !this.recommendation?.matchedItems) {
      return false;
    }
    const container = this.carouselContainer.nativeElement;
    const maxScroll = container.scrollWidth - container.clientWidth;
    return this.carouselScrollPosition < maxScroll - 10; // 10px threshold
  }
}