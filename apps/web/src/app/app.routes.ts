import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login-page.component').then(m => m.LoginPageComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register-page.component').then(m => m.RegisterPageComponent) },
  {
    path: '',
    loadComponent: () => import('./app-shell.component').then(m => m.AppShellComponent),
    canActivate: [() => !!localStorage.getItem('token')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent) },
      { path: 'tickets', loadComponent: () => import('./pages/tickets/ticket-list-page.component').then(m => m.TicketListPageComponent) },
      { path: 'tickets/new', loadComponent: () => import('./pages/tickets/ticket-form.component').then(m => m.TicketFormComponent) },
      { path: 'tickets/:id', loadComponent: () => import('./pages/tickets/ticket-detail.component').then(m => m.TicketDetailComponent) },
      { path: 'tickets/:id/edit', loadComponent: () => import('./pages/tickets/ticket-form.component').then(m => m.TicketFormComponent) },
      { path: 'customers', loadComponent: () => import('./pages/customers/customer-list-page.component').then(m => m.CustomerListPageComponent) },
      { path: 'customers/:id', loadComponent: () => import('./pages/customers/customer-detail-page.component').then(m => m.CustomerDetailPageComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings-page.component').then(m => m.SettingsPageComponent) },
    ],
  },
  // Portal routes
  {
    path: 'portal',
    loadComponent: () => import('./portal/customer-layout.component').then(m => m.CustomerLayoutComponent),
    children: [
      { path: '', redirectTo: 'tickets', pathMatch: 'full' },
      { path: 'tickets', loadComponent: () => import('./portal/customer-ticket-list.component').then(m => m.CustomerTicketListComponent) },
      { path: 'tickets/new', loadComponent: () => import('./portal/customer-ticket-form.component').then(m => m.CustomerTicketFormComponent) },
      { path: 'tickets/:id', loadComponent: () => import('./portal/customer-ticket-detail.component').then(m => m.CustomerTicketDetailComponent) },
    ],
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found-page.component').then(m => m.NotFoundPageComponent) },
];
