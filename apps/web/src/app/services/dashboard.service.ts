import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

export interface DashboardSummary {
  openTickets: number;
  pendingTickets: number;
  resolvedToday: number;
  avgResolutionTime: number;
  ticketsByStatus: { status: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  trend: { date: string; created: number; resolved: number }[];
  urgentUnassigned: any[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly days = signal(7);

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('days', this.days());

    this.http.get<DashboardSummary>('/api/dashboard/summary', { params }).pipe(
      tap(s => {
        this.summary.set(s);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Failed to load dashboard');
        return of(undefined);
      })
    ).subscribe();
  }

  setDays(days: number): void {
    this.days.set(days);
    this.load();
  }
}
