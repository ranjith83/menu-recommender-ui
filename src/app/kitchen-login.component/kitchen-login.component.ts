// components/kitchen-login/kitchen-login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-kitchen-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kitchen-login.component.html',
  styleUrls: ['./kitchen-login.component.css']
})
export class KitchenLoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.loading = true;

    // Simulate API delay
    setTimeout(() => {
      const result = this.authService.login(this.username, this.password);
      
      if (result.success) {
        this.router.navigate(['/kitchen']);
      } else {
        this.errorMessage = result.message;
      }
      
      this.loading = false;
    }, 800);
  }

  goToMenu(): void {
    this.router.navigate(['/']);
  }
}