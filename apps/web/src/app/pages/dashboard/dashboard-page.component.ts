import { Component, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/error-state.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { BadgeComponent } from '../../shared/badge.component';
import { ButtonComponent } from '../../shared/button.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSkeletonComponent, ErrorStateComponent, EmptyStateComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Overview of your help desk</p>
        </div>
        <div class="flex gap-2">
          <app-button [variant]="dashboardService.days() === 7 ? 'primary' : 'secondary'" size="sm" (click)="dashboardService.setDays(7)">7 days</app-button>
          <app-button [variant]="dashboardService.days() === 30 ? 'primary' : 'secondary'" size="sm" (click)="dashboardService.setDays(30)">30 days</app-button>
        </div>
      </div>

      @if (dashboardService.loading()) {
        <app-loading-skeleton type="card" [count]="4" />
        <app-loading-skeleton type="chart" [count]="3" />
      } @else if (dashboardService.error(); as err) {
        <app-error-state [message]="err" (retry)="dashboardService.load()" />
      } @else if (dashboardService.summary(); as s) {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-card">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Open Tickets</p>
            <p class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{{ s.openTickets }}</p>
          </div>
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-card">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Pending</p>
            <p class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{{ s.pendingTickets }}</p>
          </div>
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-card">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Resolved Today</p>
            <p class="text-3xl font-bold text-success-600 dark:text-success-400 mt-1">{{ s.resolvedToday }}</p>
          </div>
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-card">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">Avg Resolution</p>
            <p class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{{ s.avgResolutionTime }}h</p>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Status Bar Chart -->
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card">
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Tickets by Status</h3>
            <svg viewBox="0 0 400 200" class="w-full h-48" role="img" aria-label="Bar chart of tickets by status">
              @for (item of statusBars(s); track item.label) {
                <rect x="50" [attr.y]="item.y" [attr.width]="item.width" height="24" rx="4" [attr.fill]="item.color" />
                <text x="45" [attr.y]="item.y + 17" text-anchor="end" class="text-xs fill-neutral-600 dark:fill-neutral-400">{{ item.label }}</text>
                <text [attr.x]="item.width + 55" [attr.y]="item.y + 17" class="text-xs font-medium fill-neutral-800 dark:fill-neutral-200">{{ item.count }}</text>
              }
            </svg>
          </div>

          <!-- Priority Bar Chart -->
          <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card">
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Tickets by Priority</h3>
            <svg viewBox="0 0 400 200" class="w-full h-48" role="img" aria-label="Bar chart of tickets by priority">
              @for (item of priorityBars(s); track item.label) {
                <rect x="50" [attr.y]="item.y" [attr.width]="item.width" height="24" rx="4" [attr.fill]="item.color" />
                <text x="45" [attr.y]="item.y + 17" text-anchor="end" class="text-xs fill-neutral-600 dark:fill-neutral-400">{{ item.label }}</text>
                <text [attr.x]="item.width + 55" [attr.y]="item.y + 17" class="text-xs font-medium fill-neutral-800 dark:fill-neutral-200">{{ item.count }}</text>
              }
            </svg>
          </div>
        </div>

        <!-- Trend Line Chart -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card">
          <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">7-Day Trend</h3>
          @if (s.trend?.length) {
            <svg viewBox="0 0 700 200" class="w-full h-48" role="img" aria-label="Line chart of ticket trend">
              <!-- Grid lines -->
              <line x1="60" y1="30" x2="680" y2="30" stroke="currentColor" class="text-neutral-200 dark:text-neutral-700" stroke-dasharray="4,4" />
              <line x1="60" y1="85" x2="680" y2="85" stroke="currentColor" class="text-neutral-200 dark:text-neutral-700" stroke-dasharray="4,4" />
              <line x1="60" y1="140" x2="680" y2="140" stroke="currentColor" class="text-neutral-200 dark:text-neutral-700" stroke-dasharray="4,4" />
              <line x1="60" y1="30" x2="60" y2="180" stroke="currentColor" class="text-neutral-300 dark:text-neutral-600" />

              <!-- Created line -->
              <polyline
                fill="none"
                stroke="var(--color-primary-500)"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                [attr.points]="createdLinePoints(s.trend)"
              />
              <!-- Resolved line -->
              <polyline
                fill="none"
                stroke="var(--color-success-500)"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-dasharray="6,3"
                [attr.points]="resolvedLinePoints(s.trend)"
              />
              <!-- Labels -->
              @for (day of trendLabels(s.trend); track day.date) {
                <text [attr.x]="day.x" y="195" text-anchor="middle" class="text-[10px] fill-neutral-500">{{ day.label }}</text>
              }
              <!-- Legend -->
              <circle cx="590" cy="16" r="4" fill="var(--color-primary-500)" />
              <text x="600" y="20" class="text-[11px] fill-neutral-600 dark:fill-neutral-400">Created</text>
              <line x1="650" y1="16" x2="666" y2="16" stroke="var(--color-success-500)" stroke-width="2" stroke-dasharray="4,2" />
              <text x="672" y="20" class="text-[11px] fill-neutral-600 dark:fill-neutral-400">Resolved</text>
            </svg>
          } @else {
            <div class="h-48 flex items-center justify-center text-sm text-neutral-500">No trend data available</div>
          }
        </div>

        <!-- Urgent Unassigned Table -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Urgent & Unassigned</h3>
          </div>
          @if (s.urgentUnassigned?.length) {
            <table class="w-full">
              <thead>
                <tr class="text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-700">
                  <th class="text-left px-6 py-3">ID</th>
                  <th class="text-left px-6 py-3">Title</th>
                  <th class="text-left px-6 py-3">Status</th>
                  <th class="text-left px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                @for (ticket of s.urgentUnassigned; track ticket.id) {
                  <tr class="border-b border-neutral-100 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer" [routerLink]="'/tickets/' + ticket.id">
                    <td class="px-6 py-3 text-sm font-mono text-neutral-500">#{{ ticket.ticketNumber }}</td>
                    <td class="px-6 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ ticket.title }}</td>
                    <td class="px-6 py-3">
                      <app-badge [label]="ticket.status" [color]="statusColor(ticket.status)" variant="subtle" />
                    </td>
                    <td class="px-6 py-3 text-sm text-neutral-500">{{ ticket.createdAt | date:'mediumDate' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <app-empty-state title="No urgent tickets" description="All urgent tickets are assigned" />
          }
        </div>
      } @else {
        <app-empty-state title="No dashboard data" description="Could not load dashboard information" />
      }
    </div>
  `,
})
export class DashboardPageComponent implements OnInit {
  readonly dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.load();
  }

  protected statusBars(s: DashboardSummary): any[] {
    const max = Math.max(...s.ticketsByStatus.map(t => t.count), 1);
    const colors: Record<string, string> = {
      open: 'var(--color-primary-500)',
      pending: 'var(--color-warning-500)',
      resolved: 'var(--color-success-500)',
      closed: 'var(--color-neutral-400)',
    };
    return s.ticketsByStatus.map((t, i) => ({
      label: t.status,
      count: t.count,
      width: Math.max((t.count / max) * 300, 10),
      y: 30 + i * 45,
      color: colors[t.status] || 'var(--color-neutral-400)',
    }));
  }

  protected priorityBars(s: DashboardSummary): any[] {
    const max = Math.max(...s.ticketsByPriority.map(t => t.count), 1);
    const colors: Record<string, string> = {
      low: 'var(--color-neutral-400)',
      medium: 'var(--color-warning-400)',
      high: 'var(--color-accent-500)',
      urgent: 'var(--color-danger-500)',
    };
    return s.ticketsByPriority.map((t, i) => ({
      label: t.priority,
      count: t.count,
      width: Math.max((t.count / max) * 300, 10),
      y: 30 + i * 45,
      color: colors[t.priority] || 'var(--color-neutral-400)',
    }));
  }

  protected createdLinePoints(trend: DashboardSummary['trend']): string {
    if (!trend?.length) return '';
    const max = Math.max(...trend.map(t => Math.max(t.created, t.resolved)), 1);
    return trend.map((t, i) => {
      const x = 60 + (i * 620) / Math.max(trend.length - 1, 1);
      const y = 180 - (t.created / max) * 140;
      return `${x},${y}`;
    }).join(' ');
  }

  protected resolvedLinePoints(trend: DashboardSummary['trend']): string {
    if (!trend?.length) return '';
    const max = Math.max(...trend.map(t => Math.max(t.created, t.resolved)), 1);
    return trend.map((t, i) => {
      const x = 60 + (i * 620) / Math.max(trend.length - 1, 1);
      const y = 180 - (t.resolved / max) * 140;
      return `${x},${y}`;
    }).join(' ');
  }

  protected trendLabels(trend: DashboardSummary['trend']): any[] {
    if (!trend?.length) return [];
    return trend.map((t, i) => ({
      label: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      x: 60 + (i * 620) / Math.max(trend.length - 1, 1),
      date: t.date,
    }));
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
