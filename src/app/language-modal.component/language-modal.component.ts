import { Component, EventEmitter, Output, Input, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadSavedLanguage();
    
    if (this.isBrowser && this.isOpen) {
      this.setBodyScroll(false);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.setBodyScroll(true);
    }
  }

  ngOnChanges(): void {
    if (this.isBrowser) {
      this.setBodyScroll(!this.isOpen);
    }
  }

  private setBodyScroll(enable: boolean): void {
    if (!this.isBrowser) return;
    
    if (enable) {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    } else {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    }
  }

  private loadSavedLanguage(): void {
    if (!this.isBrowser) {
      this.selectedLanguage = SUPPORTED_LANGUAGES[0];
      return;
    }

    try {
      const savedLangData = localStorage.getItem('userLanguage');
      if (savedLangData) {
        this.selectedLanguage = JSON.parse(savedLangData);
      } else {
        this.selectedLanguage = SUPPORTED_LANGUAGES[0];
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
      this.selectedLanguage = SUPPORTED_LANGUAGES[0];
    }
  }

  selectLanguage(language: Language): void {
    this.selectedLanguage = language;
  }

  confirm(): void {
    if (this.selectedLanguage) {
      if (this.isBrowser) {
        try {
          localStorage.setItem('userLanguage', JSON.stringify(this.selectedLanguage));
        } catch (error) {
          console.error('Error saving language to localStorage:', error);
        }
      }
      
      this.languageSelected.emit(this.selectedLanguage);
      
      if (this.isBrowser) {
        this.setBodyScroll(true);
      }
    }
  }

  close(): void {
    if (this.isBrowser) {
      this.setBodyScroll(true);
    }
    
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}