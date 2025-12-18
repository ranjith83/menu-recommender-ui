import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, of, delay } from 'rxjs';
import { RecommendationRequest, RecommendationResponse, MenuItem } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = 'http://localhost:7084/api';
  private useMockData = true; // Set to false to use real API

  constructor(private http: HttpClient) { }

  getRecommendations(request: RecommendationRequest): Observable<RecommendationResponse> {
    // Use mock data for prototype/testing
    if (this.useMockData) {
      return this.getMockRecommendations(request).pipe(
        delay(10) // Simulate API delay
      );
    }

    // Real API call
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<RecommendationResponse>(
      `${this.apiUrl}/recommendation`,
      request,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private getMockRecommendations(request: RecommendationRequest): Observable<RecommendationResponse> {
   const mockItems: MenuItem[] = [
      {
        id: 1,
        name: 'Grilled Atlantic Salmon',
        description: 'Fresh Atlantic salmon with lemon butter sauce, roasted vegetables, and herb-infused quinoa',
        price: 28.50,
        category: 'Main Course',
        cuisine: 'Contemporary Irish',
        ingredients: ['Atlantic Salmon', 'Lemon', 'Butter', 'Quinoa', 'Seasonal Vegetables'],
        dietaryTags: ['gluten-free'],
        spiceLevel: 'Mild',
        calories: 520,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Wild Mushroom Risotto',
        description: 'Creamy Arborio rice with foraged wild mushrooms, truffle oil, and aged parmesan',
        price: 24.00,
        category: 'Main Course',
        cuisine: 'Italian-Irish Fusion',
        ingredients: ['Arborio Rice', 'Wild Mushrooms', 'Truffle Oil', 'Parmesan', 'White Wine'],
        dietaryTags: ['vegetarian'],
        spiceLevel: 'None',
        calories: 480,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Connemara Lamb Shank',
        description: 'Slow-braised Connemara lamb with rosemary jus, creamy mash, and root vegetables',
        price: 32.00,
        category: 'Main Course',
        cuisine: 'Irish Traditional',
        ingredients: ['Connemara Lamb', 'Rosemary', 'Potatoes', 'Carrots', 'Red Wine'],
        dietaryTags: [],
        spiceLevel: 'Mild',
        calories: 680,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Pan-Seared Sea Bass',
        description: 'Line-caught sea bass with seaweed butter, heritage potatoes, and samphire',
        price: 29.50,
        category: 'Main Course',
        cuisine: 'Contemporary Irish',
        ingredients: ['Sea Bass', 'Seaweed Butter', 'Heritage Potatoes', 'Samphire', 'Lemon'],
        dietaryTags: ['gluten-free'],
        spiceLevel: 'None',
        calories: 450,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Vegan Buddha Bowl',
        description: 'Quinoa, roasted chickpeas, avocado, kale, tahini dressing, and fermented vegetables',
        price: 22.00,
        category: 'Main Course',
        cuisine: 'Modern Healthy',
        ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Kale', 'Tahini', 'Fermented Vegetables'],
        dietaryTags: ['vegan', 'vegetarian', 'gluten-free'],
        spiceLevel: 'Mild',
        calories: 420,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: 'Irish Beef Burger',
        description: '8oz Irish beef patty, aged cheddar, caramelized onions, pickles, and hand-cut chips',
        price: 18.50,
        category: 'Main Course',
        cuisine: 'Irish Comfort Food',
        ingredients: ['Irish Beef', 'Cheddar', 'Brioche Bun', 'Onions', 'Pickles', 'Potatoes'],
        dietaryTags: [],
        spiceLevel: 'Medium',
        calories: 780,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        name: 'Seafood Chowder',
        description: 'Creamy traditional Irish seafood chowder with fresh catches, served with soda bread',
        price: 16.00,
        category: 'Starter',
        cuisine: 'Irish Traditional',
        ingredients: ['Salmon', 'Cod', 'Mussels', 'Cream', 'Potatoes', 'Herbs', 'Soda Bread'],
        dietaryTags: [],
        spiceLevel: 'None',
        calories: 380,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        name: 'Chicken Caesar Salad',
        description: 'Grilled free-range chicken, romaine lettuce, parmesan, croutons, and Caesar dressing',
        price: 19.00,
        category: 'Salad',
        cuisine: 'Contemporary',
        ingredients: ['Chicken', 'Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
        dietaryTags: [],
        spiceLevel: 'None',
        calories: 520,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 9,
        name: 'Spicy Thai Curry',
        description: 'Red Thai curry with coconut milk, vegetables, jasmine rice, and your choice of protein',
        price: 21.50,
        category: 'Main Course',
        cuisine: 'Thai',
        ingredients: ['Coconut Milk', 'Red Curry Paste', 'Bell Peppers', 'Bamboo Shoots', 'Jasmine Rice'],
        dietaryTags: ['gluten-free'],
        spiceLevel: 'Hot',
        calories: 590,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 10,
        name: 'Margherita Pizza',
        description: 'Wood-fired pizza with San Marzano tomatoes, buffalo mozzarella, and fresh basil',
        price: 17.00,
        category: 'Main Course',
        cuisine: 'Italian',
        ingredients: ['Pizza Dough', 'San Marzano Tomatoes', 'Mozzarella', 'Basil', 'Olive Oil'],
        dietaryTags: ['vegetarian'],
        spiceLevel: 'None',
        calories: 620,
        imageUrl: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Filter items based on dietary restrictions
    let filteredItems = [...mockItems];
    
    if (request.dietaryRestrictions && request.dietaryRestrictions.length > 0) {
      filteredItems = filteredItems.filter(item => 
        request.dietaryRestrictions!.some(restriction => 
          item.dietaryTags.includes(restriction)
        )
      );
    }

    // Filter by max price
    if (request.maxPrice) {
      filteredItems = filteredItems.filter(item => item.price <= request.maxPrice!);
    }

    // Limit to topK items (default 5)
    const topK = request.topK || 5;
    filteredItems = filteredItems.slice(0, topK);

    // Generate recommendation text based on query
    const recommendationText = this.generateRecommendationText(request, filteredItems);

    const response: RecommendationResponse = {
      recommendation: recommendationText,
      matchedItems: filteredItems,
      totalMatches: filteredItems.length,
      query: request.query,
      timestamp: new Date()
    };

    return of(response);
  }

  private generateRecommendationText(request: RecommendationRequest, items: MenuItem[]): string {
    const query = request.query.toLowerCase();
    let text = '';

    if (items.length === 0) {
      return 'Sorry, we couldn\'t find any dishes matching your preferences. Try adjusting your filters or dietary restrictions.';
    }

    // Generate personalized recommendation based on query
    if (query.includes('healthy') || query.includes('light')) {
      text = `Based on your preference for healthy, light options, we've selected ${items.length} dishes that are nutritious and fresh. `;
    } else if (query.includes('spicy') || query.includes('hot')) {
      text = `For those who love bold, spicy flavors, we recommend these ${items.length} exciting dishes that pack some heat! `;
    } else if (query.includes('vegetarian') || query.includes('vegan')) {
      text = `We've curated ${items.length} delicious plant-based options that are both satisfying and flavorful. `;
    } else if (query.includes('seafood') || query.includes('fish')) {
      text = `Fresh from the Atlantic, here are ${items.length} seafood dishes featuring the finest catches. `;
    } else if (query.includes('comfort') || query.includes('hearty')) {
      text = `For a comforting meal, we've selected ${items.length} hearty dishes that will warm your soul. `;
    } else {
      text = `Based on your preferences, we've handpicked ${items.length} exceptional dishes for you. `;
    }

    // Add dietary restriction info
    if (request.dietaryRestrictions && request.dietaryRestrictions.length > 0) {
      text += `All options meet your ${request.dietaryRestrictions.join(', ')} requirements. `;
    }

    // Add price info
    if (request.maxPrice) {
      text += `These selections are within your budget of $${request.maxPrice}. `;
    }

    text += 'Each dish is crafted with locally sourced ingredients and prepared by our expert chefs. Enjoy!';

    return text;
  }

  getAllMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/menu`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }
}