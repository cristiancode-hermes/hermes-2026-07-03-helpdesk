import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CustomerService } from '../../services/customer.service';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/error-state.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ModalComponent } from '../../shared/modal.component';
import { ButtonComponent } from '../../shared/button.component';

@Component({
  selector: 'app-customer-list-page',
  standalone: true,
  imports: [FormsModule, DatePipe, LoadingSkeletonComponent, ErrorStateComponent, EmptyStateComponent, ModalComponent, ButtonComponent],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Customers</h1>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage your customers</p>
        </div>
        <app-button variant="primary" (click)="showCreateModal.set(true)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Customer
        </app-button>
      </div>

      <!-- Search -->
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-4">
        <input type="text" [(ngModel)]="query" (input)="onSearch()" placeholder="Search by name or email..."
          class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      @if (customerService.loading()) {
        <app-loading-skeleton type="table" [count]="6" />
      } @else if (customerService.error(); as err) {
        <app-error-state [message]="err" (retry)="loadCustomers()" />
      } @else if (customerService.customers().length === 0) {
        <app-empty-state title="No customers found" description="Get started by creating your first customer" actionLabel="New Customer" (action)="showCreateModal.set(true)" />
      } @else {
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
                <th class="text-left px-6 py-3">Name</th>
                <th class="text-left px-6 py-3">Email</th>
                <th class="text-left px-6 py-3">Phone</th>
                <th class="text-left px-6 py-3">Tickets</th>
                <th class="text-left px-6 py-3">Created</th>
                <th class="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of customerService.customers(); track c.id) {
                <tr class="border-b border-neutral-100 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <td class="px-6 py-4 cursor-pointer" (click)="router.navigate(['/customers', c.id])">
                    <span class="text-sm font-medium text-primary-600 hover:text-primary-700">{{ c.name }}</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{{ c.email }}</td>
                  <td class="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{{ c.phone || '—' }}</td>
                  <td class="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{{ c.ticketCount || 0 }}</td>
                  <td class="px-6 py-4 text-sm text-neutral-500">{{ c.createdAt | date:'MMM d, y' }}</td>
                  <td class="px-6 py-4 text-right">
                    <button (click)="editCustomer(c)" class="text-sm text-primary-600 hover:text-primary-700 mr-3">Edit</button>
                    <button (click)="confirmDeleteCustomer(c)" class="text-sm text-danger-600 hover:text-danger-700">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Create/Edit Modal -->
    <app-modal [isOpen]="showCreateModal() || showEditModal()" [title]="showEditModal() ? 'Edit Customer' : 'New Customer'" (close)="closeModals()">
      @if (formError()) {
        <div class="bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 text-sm px-4 py-3 rounded-lg mb-4">{{ formError() }}</div>
      }
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Name *</label>
          <input type="text" [(ngModel)]="formName" placeholder="Customer name"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email *</label>
          <input type="email" [(ngModel)]="formEmail" placeholder="customer@example.com"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Phone</label>
          <input type="tel" [(ngModel)]="formPhone" placeholder="+1 (555) 000-0000"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <app-button variant="secondary" (click)="closeModals()">Cancel</app-button>
          <app-button variant="primary" [loading]="formSaving()" (click)="saveCustomer()">
            {{ showEditModal() ? 'Update' : 'Create' }}
          </app-button>
        </div>
      </div>
    </app-modal>

    <!-- Delete Confirmation -->
    <app-modal [isOpen]="showDeleteModal()" title="Delete Customer" size="sm" (close)="showDeleteModal.set(false)">
      <div class="space-y-4">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to delete <strong>{{ deletingCustomer?.name }}</strong>? This cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <app-button variant="secondary" (click)="showDeleteModal.set(false)">Cancel</app-button>
          <app-button variant="danger" [loading]="formSaving()" (click)="doDelete()">Delete</app-button>
        </div>
      </div>
    </app-modal>
  `,
})
export class CustomerListPageComponent implements OnInit {
  readonly customerService = inject(CustomerService);
  readonly router = inject(Router);

  readonly query = signal('');
  readonly showCreateModal = signal(false);
  readonly showEditModal = signal(false);
  readonly showDeleteModal = signal(false);
  readonly formName = signal('');
  readonly formEmail = signal('');
  readonly formPhone = signal('');
  readonly formSaving = signal(false);
  readonly formError = signal<string | null>(null);

  private editingCustomer: any = null;
  protected deletingCustomer: any = null;
  private searchTimeout: any;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.list(this.query() || undefined);
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadCustomers(), 300);
  }

  editCustomer(c: any): void {
    this.editingCustomer = c;
    this.formName.set(c.name);
    this.formEmail.set(c.email);
    this.formPhone.set(c.phone || '');
    this.showEditModal.set(true);
  }

  confirmDeleteCustomer(c: any): void {
    this.deletingCustomer = c;
    this.showDeleteModal.set(true);
  }

  closeModals(): void {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.editingCustomer = null;
    this.formName.set('');
    this.formEmail.set('');
    this.formPhone.set('');
    this.formError.set(null);
  }

  saveCustomer(): void {
    if (!this.formName().trim() || !this.formEmail().trim()) {
      this.formError.set('Name and email are required');
      return;
    }
    this.formSaving.set(true);
    this.formError.set(null);

    const data = { name: this.formName().trim(), email: this.formEmail().trim(), phone: this.formPhone().trim() || undefined };

    if (this.editingCustomer) {
      this.customerService.update(this.editingCustomer.id, data).subscribe({
        next: () => {
          this.formSaving.set(false);
          this.closeModals();
          this.loadCustomers();
        },
        error: (err) => {
          this.formSaving.set(false);
          this.formError.set(err.error?.message || 'Failed to update customer');
        },
      });
    } else {
      this.customerService.create(data).subscribe({
        next: () => {
          this.formSaving.set(false);
          this.closeModals();
          this.loadCustomers();
        },
        error: (err) => {
          this.formSaving.set(false);
          this.formError.set(err.error?.message || 'Failed to create customer');
        },
      });
    }
  }

  doDelete(): void {
    if (!this.deletingCustomer) return;
    this.formSaving.set(true);
    this.customerService.delete(this.deletingCustomer.id).subscribe({
      next: () => {
        this.formSaving.set(false);
        this.showDeleteModal.set(false);
        this.deletingCustomer = null;
        this.loadCustomers();
      },
      error: () => this.formSaving.set(false),
    });
  }
}
