import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <!-- Simple top bar -->
      <header class="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 lg:px-6">
        <div class="flex items-center gap-4">
          <span class="text-xl font-bold text-primary-600" style="font-family: 'Inter', sans-serif;">HelpDesk</span>
          <span class="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">Customer Portal</span>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="themeService.toggle()" class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            @if (themeService.isDark()) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            }
          </button>
          <button (click)="authService.logout()" class="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">Sign out</button>
        </div>
      </header>

      <!-- Simple nav -->
      <div class="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div class="max-w-4xl mx-auto px-4 flex gap-4">
          <a routerLink="/portal/tickets" routerLinkActive="border-primary-600 text-primary-600"
            class="px-1 py-3 text-sm font-medium border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            My Tickets
          </a>
          <a routerLink="/portal/tickets/new" routerLinkActive="border-primary-600 text-primary-600"
            class="px-1 py-3 text-sm font-medium border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            New Ticket
          </a>
        </div>
      </div>

      <!-- Content -->
      <main class="max-w-4xl mx-auto p-4 lg:p-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class CustomerLayoutComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
}
