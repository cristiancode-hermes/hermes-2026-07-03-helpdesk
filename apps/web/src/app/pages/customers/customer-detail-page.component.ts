import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CustomerService } from '../../services/customer.service';
import { TicketService } from '../../services/ticket.service';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/error-state.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { BadgeComponent } from '../../shared/badge.component';
import { PriorityDotComponent } from '../../shared/priority-dot.component';

@Component({
  selector: 'app-customer-detail-page',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSkeletonComponent, ErrorStateComponent, EmptyStateComponent, BadgeComponent, PriorityDotComponent],
  template: `
    <div class="space-y-6">
      <button (click)="router.navigate(['/customers'])" class="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7l-7-7 7-7"></path>
        </svg>
        Back to Customers
      </button>

      @if (customerService.customerLoading()) {
        <app-loading-skeleton type="card" [count]="1" />
      } @else if (customerService.customerError(); as err) {
        <app-error-state [message]="err" (retry)="loadCustomer()" />
      } @else if (customerService.currentCustomer(); as c) {
        <!-- Customer Info Card -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-6">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{{ c.name }}</h1>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{{ c.email }}</p>
              @if (c.phone) {
                <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ c.phone }}</p>
              }
            </div>
            <div class="text-right text-sm text-neutral-500">
              <p>Customer since {{ c.createdAt | date:'MMM y' }}</p>
            </div>
          </div>
        </div>

        <!-- Tickets -->
        <div>
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Tickets</h2>

          @if (ticketService.loading()) {
            <app-loading-skeleton type="table" [count]="4" />
          } @else {
            <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
              @if (ticketService.tickets().length) {
                <table class="w-full">
                  <thead>
                    <tr class="text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
                      <th class="text-left px-6 py-3">ID</th>
                      <th class="text-left px-6 py-3">Title</th>
                      <th class="text-left px-6 py-3">Status</th>
                      <th class="text-left px-6 py-3">Priority</th>
                      <th class="text-left px-6 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (t of ticketService.tickets(); track t.id) {
                      <tr class="border-b border-neutral-100 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer" [routerLink]="'/tickets/' + t.id">
                        <td class="px-6 py-4 text-sm font-mono text-neutral-500">#{{ t.ticketNumber }}</td>
                        <td class="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ t.title }}</td>
                        <td class="px-6 py-4">
                          <app-badge [label]="t.status" [color]="statusColor(t.status)" variant="subtle" />
                        </td>
                        <td class="px-6 py-4">
                          <app-priority-dot [priority]="t.priority" />
                        </td>
                        <td class="px-6 py-4 text-sm text-neutral-500">{{ t.createdAt | date:'MMM d, y' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <app-empty-state title="No tickets" description="This customer hasn't created any tickets yet" />
              }
            </div>
          }
        </div>
      } @else {
        <app-error-state message="Customer not found" />
      }
    </div>
  `,
})
export class CustomerDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly customerService = inject(CustomerService);
  readonly ticketService = inject(TicketService);

  private customerId: string | null = null;

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.loadCustomer();
    }
  }

  loadCustomer(): void {
    if (!this.customerId) return;
    this.customerService.getById(this.customerId);
    this.ticketService.list({ customerId: this.customerId, limit: 50 });
  }

  protected statusColor(status: string): string {
    switch (status) {
      case 'open': return 'primary';
      case 'pending': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'neutral';
      default: return 'neutral';
    }
  }
}
