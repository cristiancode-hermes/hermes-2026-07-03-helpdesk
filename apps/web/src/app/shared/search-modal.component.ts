import { Component, inject, HostListener, signal, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../services/search.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (searchService.open()) {
      <div class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] animate-fade-in">
        <div class="fixed inset-0 bg-black/50" (click)="searchService.close()"></div>
        <div class="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal w-full max-w-lg mx-4 animate-slide-up">
          <div class="flex items-center px-4 border-b border-neutral-200 dark:border-neutral-700">
            <svg class="w-5 h-5 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              #searchInput
              [(ngModel)]="query"
              (input)="onSearch()"
              (keydown.escape)="searchService.close()"
              placeholder="Search tickets, customers..."
              class="flex-1 px-3 py-4 bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-base"
            />
            <kbd class="hidden sm:inline-flex px-1.5 py-0.5 text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-700 rounded">ESC</kbd>
          </div>

          <div class="max-h-80 overflow-y-auto p-2">
            @if (searchService.loading()) {
              <div class="flex items-center justify-center py-8">
                <svg class="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
            } @else if (searchService.results(); as res) {
              @if (res.tickets?.length) {
                <div class="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tickets</div>
                @for (t of res.tickets; track t.id) {
                  <button (click)="navigateTo('/tickets/' + t.id)"
                    class="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3">
                    <span class="text-xs font-mono text-neutral-400">#{{ t.ticketNumber }}</span>
                    <span class="text-sm text-neutral-900 dark:text-neutral-100 truncate flex-1">{{ t.title }}</span>
                  </button>
                }
              }
              @if (res.customers?.length) {
                <div class="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-2">Customers</div>
                @for (c of res.customers; track c.id) {
                  <button (click)="navigateTo('/customers/' + c.id)"
                    class="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3">
                    <span class="text-sm text-neutral-900 dark:text-neutral-100">{{ c.name }}</span>
                    <span class="text-xs text-neutral-500">{{ c.email }}</span>
                  </button>
                }
              }
              @if (!res.tickets?.length && !res.customers?.length && query().trim()) {
                <div class="py-8 text-center text-sm text-neutral-500">No results found</div>
              }
            } @else if (query().trim()) {
              <div class="py-8 text-center text-sm text-neutral-500">No results found</div>
            } @else {
              <div class="py-8 text-center text-sm text-neutral-500">Start typing to search...</div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class SearchModalComponent {
  readonly searchService = inject(SearchService);
  private router = inject(Router);
  readonly query = signal('');

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private debounceTimer: any;

  onSearch(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.searchService.search(this.query());
    }, 300);
  }

  navigateTo(path: string): void {
    this.searchService.close();
    this.query.set('');
    this.router.navigateByUrl(path);
  }

  @HostListener('document:keydown.control.k', ['$event'])
  @HostListener('document:keydown.meta.k', ['$event'])
  onCtrlK(e: Event): void {
    e.preventDefault();
    this.searchService.openModal();
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 100);
  }
}
