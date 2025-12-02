import { Component } from '@angular/core';
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
export class MenuRecommenderComponent {
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
        this.recommendation = response;
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
}