import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'entertainment',
        loadComponent: () => import('./pages/dashboard/entertainment/entertainment.component').then(m => m.EntertainmentComponent)
      },
      {
        path: 'fitness',
        loadComponent: () => import('./pages/dashboard/fitness/fitness.component').then(m => m.FitnessComponent)
      },
      {
        path: 'management',
        loadComponent: () => import('./pages/dashboard/management/management.component').then(m => m.ManagementComponent)
      },
      {
        path: 'travel',
        loadComponent: () => import('./pages/dashboard/travel/travel.component').then(m => m.TravelComponent)
      },
      { path: '', redirectTo: 'entertainment', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' } // Wildcard route for a 404 page
];
