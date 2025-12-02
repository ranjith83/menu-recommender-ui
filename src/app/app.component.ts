import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuRecommenderComponent } from './menu-recommender.component/menu-recommender.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MenuRecommenderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showMenuModal: boolean = false;

  openMenuModal(): void {
    this.showMenuModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeMenuModal(): void {
    this.showMenuModal = false;
    document.body.style.overflow = 'auto';
  }
}