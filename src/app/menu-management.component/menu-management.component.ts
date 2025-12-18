import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../services/menu.service';
import { MenuItem } from '../models/menu-item.model';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.css']
})
export class MenuManagementComponent implements OnInit {
  menuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  searchQuery: string = '';
  selectedCategory: string = 'all';
  
  showMenuItemForm: boolean = false;
  editingMenuItem: MenuItem | null = null;
  
  menuForm = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    category: '',
    cuisine: '',
    ingredients: [] as string[],
    dietaryTags: [] as string[],
    spiceLevel: 'None',
    calories: 0,
    imageUrl: ''
  };

  categories = ['Starter', 'Main Course', 'Salad', 'Dessert', 'Beverage', 'Side Dish'];
  cuisines = ['Irish Traditional', 'Contemporary Irish', 'Italian', 'Thai', 'Contemporary', 'Modern Healthy', 'Asian Fusion'];
  spiceLevels = ['None', 'Mild', 'Medium', 'Hot', 'Very Hot'];
  availableDietaryTags = ['vegetarian', 'vegan', 'halal', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo'];

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.menuService.getAllMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
        this.filterMenuItems();
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
      }
    });
  }

  filterMenuItems(): void {
    let filtered = [...this.menuItems];

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.cuisine?.toLowerCase().includes(query)
      );
    }

    this.filteredMenuItems = filtered;
  }

  onSearchChange(): void {
    this.filterMenuItems();
  }

  onCategoryChange(): void {
    this.filterMenuItems();
  }

  openMenuItemForm(item?: MenuItem): void {
    if (item) {
      this.editingMenuItem = item;
      this.menuForm = {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category || '',
        cuisine: item.cuisine || '',
        ingredients: [...(item.ingredients || [])],
        dietaryTags: [...(item.dietaryTags || [])],
        spiceLevel: item.spiceLevel || 'None',
        calories: item.calories || 0,
        imageUrl: item.imageUrl || ''
      };
    } else {
      this.editingMenuItem = null;
      this.menuForm = {
        id: Date.now(),
        name: '',
        description: '',
        price: 0,
        category: this.categories[0],
        cuisine: this.cuisines[0],
        ingredients: [],
        dietaryTags: [],
        spiceLevel: 'None',
        calories: 0,
        imageUrl: ''
      };
    }
    this.showMenuItemForm = true;
  }

  closeMenuItemForm(): void {
    this.showMenuItemForm = false;
    this.editingMenuItem = null;
  }

  saveMenuItem(): void {
    if (!this.menuForm.name || this.menuForm.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const menuItemData = {
      name: this.menuForm.name,
      description: this.menuForm.description,
      price: this.menuForm.price,
      category: this.menuForm.category,
      cuisine: this.menuForm.cuisine,
      ingredients: this.menuForm.ingredients,
      dietaryTags: this.menuForm.dietaryTags,
      spiceLevel: this.menuForm.spiceLevel,
      calories: this.menuForm.calories,
      imageUrl: this.menuForm.imageUrl
    };

    if (this.editingMenuItem) {
      this.menuService.updateMenuItem(this.editingMenuItem.id, menuItemData).subscribe({
        next: () => {
          this.loadMenuItems();
          this.closeMenuItemForm();
          this.showSuccessMessage('Menu item updated successfully');
        },
        error: (error) => {
          console.error('Error updating menu item:', error);
          alert('Failed to update menu item');
        }
      });
    } else {
      this.menuService.createMenuItem(menuItemData).subscribe({
        next: () => {
          this.loadMenuItems();
          this.closeMenuItemForm();
          this.showSuccessMessage('Menu item created successfully');
        },
        error: (error) => {
          console.error('Error creating menu item:', error);
          alert('Failed to create menu item');
        }
      });
    }
  }

  deleteMenuItem(item: MenuItem): void {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.menuService.deleteMenuItem(item.id).subscribe({
        next: () => {
          this.loadMenuItems();
          this.showSuccessMessage('Menu item deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting menu item:', error);
          alert('Failed to delete menu item');
        }
      });
    }
  }

  toggleDietaryTag(tag: string): void {
    const index = this.menuForm.dietaryTags.indexOf(tag);
    if (index > -1) {
      this.menuForm.dietaryTags.splice(index, 1);
    } else {
      this.menuForm.dietaryTags.push(tag);
    }
  }

  addIngredient(input: HTMLInputElement): void {
    const ingredient = input.value.trim();
    if (ingredient && !this.menuForm.ingredients.includes(ingredient)) {
      this.menuForm.ingredients.push(ingredient);
      input.value = '';
    }
  }

  removeIngredient(ingredient: string): void {
    this.menuForm.ingredients = this.menuForm.ingredients.filter(i => i !== ingredient);
  }

  private showSuccessMessage(message: string): void {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span class="font-medium">${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }
}