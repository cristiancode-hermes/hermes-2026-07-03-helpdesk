import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-950">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Page not found</h2>
        <p class="text-neutral-500 dark:text-neutral-400 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <a routerLink="/dashboard" class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7l-7-7 7-7"></path>
          </svg>
          Go to Dashboard
        </a>
      </div>
    </div>
  `,
})
export class NotFoundPageComponent {}
