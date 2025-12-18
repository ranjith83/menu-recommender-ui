import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SUPPORTED_LANGUAGES, Language } from '../models/order.model';

@Component({
  selector: 'app-language-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-modal.component.html',    
  styleUrls: ['./language-modal.component.css'],
})
export class LanguageModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() languageSelected = new EventEmitter<Language>();
  @Output() closed = new EventEmitter<void>();

  languages = SUPPORTED_LANGUAGES;
  selectedLanguage: Language | null = null;

  ngOnInit(): void {
    // Load saved language from localStorage if available
    this.loadSavedLanguage();
    
    // Prevent body scroll when modal is open
    if (this.isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    // Restore body scroll on component destroy
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
  }

  ngOnChanges(): void {
    // Handle body scroll when isOpen changes
    if (this.isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    }
  }

  private loadSavedLanguage(): void {
    try {
      const savedLangData = localStorage.getItem('userLanguage');
      if (savedLangData) {
        this.selectedLanguage = JSON.parse(savedLangData);
        console.log('Loaded saved language in modal:', this.selectedLanguage);
      } else {
        // Default to English if no saved language
        this.selectedLanguage = SUPPORTED_LANGUAGES[0];
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
      // Default to English on error
      this.selectedLanguage = SUPPORTED_LANGUAGES[0];
    }
  }

  selectLanguage(language: Language): void {
    this.selectedLanguage = language;
    console.log('Language selected:', language);
  }

  confirm(): void {
    if (this.selectedLanguage) {
      // Save to localStorage
      try {
        localStorage.setItem('userLanguage', JSON.stringify(this.selectedLanguage));
        console.log('Language saved to localStorage:', this.selectedLanguage);
      } catch (error) {
        console.error('Error saving language to localStorage:', error);
      }
      
      // Emit the selected language
      this.languageSelected.emit(this.selectedLanguage);
      
      // Restore body scroll
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    }
  }

  close(): void {
    // Restore body scroll
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Only close if clicking directly on backdrop, not on modal content
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}