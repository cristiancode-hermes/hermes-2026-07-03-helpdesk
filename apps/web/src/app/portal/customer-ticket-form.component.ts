import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../services/ticket.service';
import { CategoryService } from '../services/category.service';
import { ButtonComponent } from '../shared/button.component';

@Component({
  selector: 'app-customer-ticket-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  template: `
    <div class="max-w-lg mx-auto space-y-6">
      <div>
        <button (click)="router.navigate(['/portal/tickets'])" class="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7l-7-7 7-7"></path>
          </svg>
          Back
        </button>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">New Ticket</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Submit a new support request</p>
      </div>

      @if (error()) {
        <div class="bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 text-sm px-4 py-3 rounded-lg">{{ error() }}</div>
      }

      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Title *</label>
          <input type="text" [(ngModel)]="title"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of your issue" />
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description *</label>
          <textarea [(ngModel)]="description" rows="5"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Detailed description of your issue"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
          <select [(ngModel)]="categoryId"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select category</option>
            @for (cat of categoryService.categories(); track cat.id) {
              <option value="{{ cat.id }}">{{ cat.name }}</option>
            }
          </select>
        </div>

        <app-button variant="primary" class="w-full" [loading]="saving()" (click)="onSubmit()">
          Submit Ticket
        </app-button>
      </div>
    </div>
  `,
})
export class CustomerTicketFormComponent {
  readonly router = inject(Router);
  readonly ticketService = inject(TicketService);
  readonly categoryService = inject(CategoryService);

  readonly title = signal('');
  readonly description = signal('');
  readonly categoryId = signal('');
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit(): void {
    if (!this.title().trim() || !this.description().trim()) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.ticketService.create({
      title: this.title().trim(),
      description: this.description().trim(),
      categoryId: this.categoryId() || undefined,
      priority: 'medium',
    }).subscribe({
      next: (ticket) => this.router.navigate(['/portal/tickets', ticket.id]),
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || err.message || 'Failed to create ticket');
      },
    });
  }
}
