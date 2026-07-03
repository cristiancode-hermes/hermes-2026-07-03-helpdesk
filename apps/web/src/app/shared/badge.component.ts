import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      [class]="badgeClass()">
      {{ label() }}
    </span>
  `,
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly color = input<string>('neutral');
  readonly variant = input<'filled' | 'outline' | 'subtle'>('filled');

  protected readonly badgeClass = computed(() => {
    const c = this.color();
    const v = this.variant();
    const colorMap: Record<string, Record<string, string>> = {
      filled: {
        neutral: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200',
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
        success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
        danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200',
        warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
        accent: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
      },
      outline: {
        neutral: 'border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300',
        primary: 'border border-primary-300 text-primary-700 dark:border-primary-600 dark:text-primary-300',
        success: 'border border-success-300 text-success-700 dark:border-success-600 dark:text-success-300',
        danger: 'border border-danger-300 text-danger-700 dark:border-danger-600 dark:text-danger-300',
        warning: 'border border-warning-300 text-warning-700 dark:border-warning-600 dark:text-warning-300',
        accent: 'border border-accent-300 text-accent-700 dark:border-accent-600 dark:text-accent-300',
      },
      subtle: {
        neutral: 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50',
        primary: 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20',
        success: 'text-success-700 dark:text-success-300 bg-success-50 dark:bg-success-900/20',
        danger: 'text-danger-700 dark:text-danger-300 bg-danger-50 dark:bg-danger-900/20',
        warning: 'text-warning-700 dark:text-warning-300 bg-warning-50 dark:bg-warning-900/20',
        accent: 'text-accent-700 dark:text-accent-300 bg-accent-50 dark:bg-accent-900/20',
      },
    };
    return colorMap[v]?.[c] || colorMap['filled']['neutral'];
  });
}
