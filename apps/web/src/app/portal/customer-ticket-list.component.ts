import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TicketService } from '../services/ticket.service';
import { AuthService } from '../services/auth.service';
import { BadgeComponent } from '../shared/badge.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-customer-ticket-list',
  standalone: true,
  imports: [RouterLink, DatePipe, BadgeComponent, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Tickets</h1>

      @if (ticketService.loading()) {
        <app-loading-skeleton type="table" [count]="4" />
      } @else if (ticketService.tickets().length === 0) {
        <app-empty-state title="No tickets yet" description="Create your first ticket to get support" actionLabel="New Ticket" (action)="router.navigate(['/portal/tickets/new'])" />
      } @else {
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
                <th class="text-left px-6 py-3">ID</th>
                <th class="text-left px-6 py-3">Title</th>
                <th class="text-left px-6 py-3">Status</th>
                <th class="text-left px-6 py-3">Created</th>
                <th class="text-left px-6 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              @for (t of ticketService.tickets(); track t.id) {
                <tr class="border-b border-neutral-100 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer" [routerLink]="'/portal/tickets/' + t.id">
                  <td class="px-6 py-4 text-sm font-mono text-neutral-500">#{{ t.ticketNumber }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ t.title }}</td>
                  <td class="px-6 py-4">
                    <app-badge [label]="t.status" [color]="statusColor(t.status)" variant="subtle" />
                  </td>
                  <td class="px-6 py-4 text-sm text-neutral-500">{{ t.createdAt | date:'MMM d, y' }}</td>
                  <td class="px-6 py-4 text-sm text-neutral-500">{{ t.updatedAt | date:'MMM d, y' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class CustomerTicketListComponent implements OnInit {
  readonly ticketService = inject(TicketService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  ngOnInit(): void {
    const customerId = this.authService.currentUser()?.id;
    if (customerId) {
      this.ticketService.list({ customerId, limit: 50 });
    }
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
