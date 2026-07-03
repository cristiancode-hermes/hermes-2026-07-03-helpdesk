import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-16 h-16 rounded-full bg-danger-50 dark:bg-danger-900/30 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">Something went wrong</h3>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-4 max-w-sm">{{ message() }}</p>
      <button (click)="retry.emit()"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
        Try again
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input('An unexpected error occurred. Please try again.');
  readonly retry = output<void>();
}
