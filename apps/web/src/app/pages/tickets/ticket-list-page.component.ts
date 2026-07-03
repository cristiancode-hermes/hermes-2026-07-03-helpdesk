import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TicketService, Ticket } from '../../services/ticket.service';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/error-state.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { PaginationComponent } from '../../shared/pagination.component';
import { BadgeComponent } from '../../shared/badge.component';
import { PriorityDotComponent } from '../../shared/priority-dot.component';
import { ButtonComponent } from '../../shared/button.component';

@Component({
  selector: 'app-ticket-list-page',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingSkeletonComponent, ErrorStateComponent, EmptyStateComponent, PaginationComponent, BadgeComponent, PriorityDotComponent, ButtonComponent, DatePipe],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Tickets</h1>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage support tickets</p>
        </div>
        <app-button variant="primary" (click)="router.navigate(['/tickets/new'])">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Ticket
        </app-button>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <select [(ngModel)]="filterStatus" (change)="applyFilters()"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <select [(ngModel)]="filterPriority" (change)="applyFilters()"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <select [(ngModel)]="filterAgent" (change)="applyFilters()"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Agents</option>
              @for (u of userService.users(); track u.id) {
                <option value="{{ u.id }}">{{ u.name }}</option>
              }
            </select>
          </div>
          <div class="sm:col-span-2">
            <input type="text" [(ngModel)]="filterQuery" (keydown.enter)="applyFilters()" placeholder="Search tickets..."
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      <!-- Table -->
      @if (ticketService.loading()) {
        <app-loading-skeleton type="table" [count]="8" />
      } @else if (ticketService.error(); as err) {
        <app-error-state [message]="err" (retry)="applyFilters()" />
      } @else if (ticketService.tickets().length === 0) {
        <app-empty-state title="No tickets match your filters" description="Try adjusting your search or filters" actionLabel="Clear Filters" (action)="clearFilters()" />
      } @else {
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
                <th class="text-left px-6 py-3 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300" (click)="toggleSort('ticketNumber')">
                  ID @if (sortBy() === 'ticketNumber') { <span>{{ sortDir() === 'asc' ? '▲' : '▼' }}</span> }
                </th>
                <th class="text-left px-6 py-3 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300" (click)="toggleSort('title')">
                  Title @if (sortBy() === 'title') { <span>{{ sortDir() === 'asc' ? '▲' : '▼' }}</span> }
                </th>
                <th class="text-left px-6 py-3">Status</th>
                <th class="text-left px-6 py-3">Priority</th>
                <th class="text-left px-6 py-3">Assigned To</th>
                <th class="text-left px-6 py-3 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300" (click)="toggleSort('createdAt')">
                  Created @if (sortBy() === 'createdAt') { <span>{{ sortDir() === 'asc' ? '▲' : '▼' }}</span> }
                </th>
              </tr>
            </thead>
            <tbody>
              @for (ticket of ticketService.tickets(); track ticket.id) {
                <tr class="border-b border-neutral-100 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors" [routerLink]="'/tickets/' + ticket.id">
                  <td class="px-6 py-4 text-sm font-mono text-neutral-500">#{{ ticket.ticketNumber }}</td>
                  <td class="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-neutral-100 max-w-xs truncate">{{ ticket.title }}</td>
                  <td class="px-6 py-4">
                    <app-badge [label]="ticket.status" [color]="statusColor(ticket.status)" variant="subtle" />
                  </td>
                  <td class="px-6 py-4">
                    <app-priority-dot [priority]="ticket.priority" />
                  </td>
                  <td class="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {{ ticket.agent?.name || ticket.agent?.id ? ticket.agent?.name : '—' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-neutral-500">{{ ticket.createdAt | date:'MMM d, y' }}</td>
                </tr>
              }
            </tbody>
          </table>
          <app-pagination
            [page]="ticketService.page()"
            [totalPages]="ticketService.totalPages()"
            [totalItems]="ticketService.total()"
            (pageChange)="onPageChange($event)"
          />
        </div>
      }
    </div>
  `,
})
export class TicketListPageComponent implements OnInit {
  readonly ticketService = inject(TicketService);
  readonly categoryService = inject(CategoryService);
  readonly userService = inject(UserService);
  readonly router = inject(Router);

  readonly filterStatus = signal('');
  readonly filterPriority = signal('');
  readonly filterAgent = signal('');
  readonly filterQuery = signal('');
  readonly sortBy = signal('createdAt');
  readonly sortDir = signal('desc');

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.ticketService.list({
      status: this.filterStatus() || undefined,
      priority: this.filterPriority() || undefined,
      agentId: this.filterAgent() || undefined,
      q: this.filterQuery() || undefined,
      page: 1,
      limit: 20,
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    });
  }

  clearFilters(): void {
    this.filterStatus.set('');
    this.filterPriority.set('');
    this.filterAgent.set('');
    this.filterQuery.set('');
    this.applyFilters();
  }

  toggleSort(field: string): void {
    if (this.sortBy() === field) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.ticketService.list({
      status: this.filterStatus() || undefined,
      priority: this.filterPriority() || undefined,
      agentId: this.filterAgent() || undefined,
      q: this.filterQuery() || undefined,
      page,
      limit: 20,
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    });
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
