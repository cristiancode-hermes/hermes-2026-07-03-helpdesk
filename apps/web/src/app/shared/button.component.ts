import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [disabled]="disabled() || loading()"
      (click)="click.emit()"
      class="inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      [class]="variantClass() + ' ' + sizeClass()"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger' | 'success'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly click = output<void>();

  protected readonly variantClass = () => {
    const v = this.variant();
    switch (v) {
      case 'primary': return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500';
      case 'secondary': return 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-400 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600';
      case 'ghost': return 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800';
      case 'danger': return 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500';
      case 'success': return 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500';
    }
  };

  protected readonly sizeClass = () => {
    const s = this.size();
    switch (s) {
      case 'sm': return 'px-3 py-1.5 text-sm';
      case 'md': return 'px-4 py-2 text-sm';
      case 'lg': return 'px-6 py-3 text-base';
    }
  };
}
