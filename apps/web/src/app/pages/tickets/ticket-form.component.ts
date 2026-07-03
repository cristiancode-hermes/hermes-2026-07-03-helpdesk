import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { TicketService } from '../../services/ticket.service';
import { CategoryService } from '../../services/category.service';
import { CustomerService } from '../../services/customer.service';
import { TagService } from '../../services/tag.service';
import { ButtonComponent } from '../../shared/button.component';
import { BadgeComponent } from '../../shared/badge.component';
import { ToastComponent } from '../../shared/toast.component';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent, ToastComponent, TitleCasePipe],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button (click)="router.navigate(['/tickets'])" class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7l-7-7 7-7"></path>
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{{ isEdit() ? 'Edit Ticket' : 'New Ticket' }}</h1>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{{ isEdit() ? 'Update ticket details' : 'Create a new support ticket' }}</p>
        </div>
      </div>

      <app-toast #toast />

      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-6 space-y-5">
        @if (saveError()) {
          <div class="bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 text-sm px-4 py-3 rounded-lg">
            {{ saveError() }}
          </div>
        }

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Title *</label>
          <input type="text" [(ngModel)]="title"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of the issue" />
          @if (showErrors() && !title().trim()) {
            <p class="text-xs text-danger-600 mt-1">Title is required</p>
          }
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description *</label>
          <textarea [(ngModel)]="description" rows="4"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Detailed description of the issue"></textarea>
          @if (showErrors() && !description().trim()) {
            <p class="text-xs text-danger-600 mt-1">Description is required</p>
          }
        </div>

        <!-- Category -->
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

        <!-- Priority -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Priority</label>
          <div class="flex gap-2">
            @for (p of priorities; track p) {
              <button (click)="priority.set(p)"
                class="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                [class]="priority() === p ? priorityBtnActive(p) : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'">
                @if (p === 'urgent') { <span class="w-2 h-2 rounded-full bg-danger-500 inline-block mr-1.5 animate-pulse"></span> }
                @else if (p === 'high') { <span class="w-2 h-2 rounded-full bg-accent-500 inline-block mr-1.5"></span> }
                @else if (p === 'medium') { <span class="w-2 h-2 rounded-full bg-warning-400 inline-block mr-1.5"></span> }
                @else { <span class="w-2 h-2 rounded-full bg-neutral-400 inline-block mr-1.5"></span> }
                {{ p | titlecase }}
              </button>
            }
          </div>
        </div>

        <!-- Customer -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Customer</label>
          @if (searchingCustomer()) {
            <div class="space-y-3">
              <input type="text" [(ngModel)]="customerName" placeholder="Customer name"
                class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="email" [(ngModel)]="customerEmail" placeholder="Customer email"
                class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <button (click)="searchingCustomer.set(false)" class="text-xs text-primary-600 hover:text-primary-700">Search existing customer instead</button>
            </div>
          } @else {
            <div class="relative">
              <input type="text" [(ngModel)]="customerQuery" (input)="searchCustomers()" placeholder="Search existing customer..."
                class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              @if (customerResults().length) {
                <div class="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-dropdown max-h-48 overflow-y-auto">
                  @for (c of customerResults(); track c.id) {
                    <button (click)="selectCustomer(c)" class="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300">
                      {{ c.name }} — {{ c.email }}
                    </button>
                  }
                </div>
              }
            </div>
            @if (selectedCustomer()) {
              <div class="mt-2 flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm">
                <span class="text-primary-700 dark:text-primary-300">{{ selectedCustomer()?.name }} ({{ selectedCustomer()?.email }})</span>
                <button (click)="clearCustomer()" class="text-primary-500 hover:text-primary-700 ml-auto">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            }
            <button (click)="searchingCustomer.set(true)" class="mt-1 text-xs text-primary-600 hover:text-primary-700">Or create new customer</button>
          }
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tags</label>
          <div class="flex flex-wrap gap-2 mb-2">
            @for (tag of tagService.tags(); track tag.id) {
              <button (click)="toggleTag(tag.id)"
                class="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                [class]="selectedTagIds().includes(tag.id) ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-300' : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'">
                {{ tag.name }}
              </button>
            }
          </div>
        </div>

        <!-- Submit -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <app-button variant="secondary" (click)="router.navigate(['/tickets'])">Cancel</app-button>
          <app-button variant="primary" [loading]="saving()" (click)="onSave()">
            {{ isEdit() ? 'Update Ticket' : 'Create Ticket' }}
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class TicketFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly ticketService = inject(TicketService);
  readonly categoryService = inject(CategoryService);
  readonly customerService = inject(CustomerService);
  readonly tagService = inject(TagService);

  readonly title = signal('');
  readonly description = signal('');
  readonly categoryId = signal('');
  readonly priority = signal<string>('medium');
  readonly selectedCustomer = signal<any>(null);
  readonly selectedTagIds = signal<string[]>([]);
  readonly customerQuery = signal('');
  readonly customerResults = signal<any[]>([]);
  readonly searchingCustomer = signal(false);
  readonly customerName = signal('');
  readonly customerEmail = signal('');
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly showErrors = signal(false);

  protected readonly priorities = ['low', 'medium', 'high', 'urgent'];
  private ticketId: string | null = null;
  private customerSearchTimeout: any;

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id');
    if (this.ticketId) {
      this.ticketService.getById(this.ticketId);
      // Wait for ticket to load
      setTimeout(() => {
        const ticket = this.ticketService.currentTicket();
        if (ticket) {
          this.title.set(ticket.title);
          this.description.set(ticket.description);
          this.categoryId.set(ticket.categoryId || '');
          this.priority.set(ticket.priority);
          this.selectedCustomer.set(ticket.customer || null);
          this.selectedTagIds.set(ticket.tagIds || []);
        }
      }, 300);
    }
  }

  protected isEdit(): boolean {
    return !!this.ticketId;
  }

  searchCustomers(): void {
    clearTimeout(this.customerSearchTimeout);
    const q = this.customerQuery().trim();
    if (!q) {
      this.customerResults.set([]);
      return;
    }
    this.customerSearchTimeout = setTimeout(() => {
      this.customerService.search(q).subscribe(results => {
        this.customerResults.set(results);
      });
    }, 300);
  }

  selectCustomer(c: any): void {
    this.selectedCustomer.set(c);
    this.customerQuery.set('');
    this.customerResults.set([]);
  }

  clearCustomer(): void {
    this.selectedCustomer.set(null);
  }

  toggleTag(tagId: string): void {
    this.selectedTagIds.update(ids =>
      ids.includes(tagId) ? ids.filter(id => id !== tagId) : [...ids, tagId]
    );
  }

  onSave(): void {
    this.showErrors.set(true);

    if (!this.title().trim() || !this.description().trim()) {
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    const payload: any = {
      title: this.title().trim(),
      description: this.description().trim(),
      categoryId: this.categoryId() || undefined,
      priority: this.priority(),
      tagIds: this.selectedTagIds(),
    };

    if (this.selectedCustomer()) {
      payload.customerId = this.selectedCustomer().id;
    } else if (this.searchingCustomer()) {
      payload.customerName = this.customerName().trim() || undefined;
      payload.customerEmail = this.customerEmail().trim() || undefined;
    }

    const request = this.isEdit()
      ? this.ticketService.update(this.ticketId!, payload)
      : this.ticketService.create(payload);

    request.subscribe({
      next: (ticket) => {
        this.router.navigate(['/tickets', ticket.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(err.error?.message || err.message || 'Failed to save ticket');
      },
    });
  }

  protected priorityBtnActive(p: string): string {
    switch (p) {
      case 'urgent': return 'bg-danger-50 border-danger-300 text-danger-700 dark:bg-danger-900/30 dark:border-danger-700';
      case 'high': return 'bg-accent-50 border-accent-300 text-accent-700 dark:bg-accent-900/30 dark:border-accent-700';
      case 'medium': return 'bg-warning-50 border-warning-300 text-warning-700 dark:bg-warning-900/30 dark:border-warning-700';
      default: return 'bg-neutral-100 border-neutral-400 text-neutral-700 dark:bg-neutral-700 dark:border-neutral-500';
    }
  }
}
