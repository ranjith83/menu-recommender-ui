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
}