import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    @switch (type()) {
      @case ('row') {
        @for (i of counts(); track i) {
          <div class="flex items-center gap-4 py-3">
            <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 animate-pulse"></div>
            <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 animate-pulse"></div>
          </div>
        }
      }
      @case ('card') {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of counts(); track i) {
            <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card space-y-3">
              <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 animate-pulse"></div>
              <div class="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 animate-pulse"></div>
            </div>
          }
        </div>
      }
      @case ('chart') {
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card">
          <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-4 animate-pulse"></div>
          <div class="h-48 bg-neutral-100 dark:bg-neutral-700/50 rounded animate-pulse"></div>
        </div>
      }
      @case ('table') {
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
          @for (i of counts(); track i) {
            <div class="flex items-center gap-4 px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
              <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16 animate-pulse"></div>
              <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 animate-pulse"></div>
              <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20 animate-pulse"></div>
              <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24 animate-pulse"></div>
            </div>
          }
        </div>
      }
      @default {
        <div class="space-y-3">
          @for (i of counts(); track i) {
            <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" style="width: {{ 60 + (i * 10) % 40 }}%"></div>
          }
        </div>
      }
    }
  `,
})
export class LoadingSkeletonComponent {
  readonly type = input<'card' | 'row' | 'chart' | 'text' | 'table'>('text');
  readonly count = input(4);

  protected readonly counts = () => Array.from({ length: this.count() }, (_, i) => i);
}
