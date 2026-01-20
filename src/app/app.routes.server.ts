
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'menu',
    renderMode: RenderMode.Client
  },
  {
    path: 'basket',
    renderMode: RenderMode.Client
  },
  {
    path: 'order-status/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'kitchen-login',
    renderMode: RenderMode.Client
  },
  {
    path: 'kitchen',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];