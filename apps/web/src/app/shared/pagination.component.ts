import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 0) {
      <div class="flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400">
          Page {{ page() }} of {{ totalPages() }} ({{ totalItems() }} total)
        </div>
        <div class="flex items-center gap-1">
          <button (click)="goToPage(1)" [disabled]="page() <= 1"
            class="px-2 py-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
            </svg>
          </button>
          <button (click)="goToPage(page() - 1)" [disabled]="page() <= 1"
            class="px-2 py-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>

          @for (p of visiblePages(); track p) {
            <button (click)="goToPage(p)"
              class="px-3 py-1 text-sm rounded font-medium transition-colors"
              [class]="p === page() ? 'bg-primary-600 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'">
              {{ p }}
            </button>
          }

          <button (click)="goToPage(page() + 1)" [disabled]="page() >= totalPages()"
            class="px-2 py-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          <button (click)="goToPage(totalPages())" [disabled]="page() >= totalPages()"
            class="px-2 py-1 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class PaginationComponent {
  readonly page = input(1);
  readonly totalPages = input(1);
  readonly totalItems = input(0);
  readonly pageChange = output<number>();

  protected goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages() && p !== this.page()) {
      this.pageChange.emit(p);
    }
  }

  protected visiblePages(): number[] {
    const current = this.page();
    const total = this.totalPages();
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    if (end - start < 4) {
      if (start === 1) end = Math.min(total, start + 4);
      else start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
