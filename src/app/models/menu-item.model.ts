export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  cuisine: string;
  ingredients: string[];
  dietaryTags: string[];
  spiceLevel?: string;
  calories?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecommendationRequest {
  query: string;
  dietaryRestrictions?: string[];
  maxPrice?: number;
  topK?: number;
}

export interface RecommendationResponse {
  query: string;
  recommendation: string;
  matchedItems: MenuItem[];
  timestamp: Date;
}

export interface DietaryOption {
  id: string;
  label: string;
  icon: string;
}

export interface PreferenceOption {
  id: string;
  label: string;
  icon: string;
}