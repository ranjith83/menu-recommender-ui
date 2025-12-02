import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

import { MenuRecommenderComponent } from './menu-recommender.component/menu-recommender.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: '', component: MenuRecommenderComponent }
];