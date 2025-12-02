import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { RecommendationRequest, RecommendationResponse, MenuItem } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = 'http://localhost:7084/api';

  constructor(private http: HttpClient) { }

  getRecommendations(request: RecommendationRequest): Observable<RecommendationResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<RecommendationResponse>(
      `${this.apiUrl}/recommendation`,
      request,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
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