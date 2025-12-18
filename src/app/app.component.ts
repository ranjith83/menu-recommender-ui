import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MenuRecommenderComponent } from './menu-recommender.component/menu-recommender.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenuRecommenderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showMenuModal: boolean = false;
  showLandingPage: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check current route on init
    this.checkRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.urlAfterRedirects || event.url);
      });
  }

  private checkRoute(url: string): void {
    // Show landing page only on root path
    this.showLandingPage = url === '/' || url === '';
    
    // Close modal if navigating away
    if (url !== '/' && url !== '') {
      this.showMenuModal = false;
    }
  }

  openMenuModal(): void {
    this.showMenuModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeMenuModal(): void {
    this.showMenuModal = false;
    document.body.style.overflow = 'auto';
  }

  navigateToMenu(): void {
    this.showLandingPage = false;
    this.router.navigate(['/menu']);
  }

  playRobotSound(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
}