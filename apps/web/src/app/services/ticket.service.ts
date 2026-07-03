import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface Ticket {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId: string;
  category?: { id: string; name: string; color: string };
  agentId?: string;
  agent?: { id: string; name: string };
  customerId?: string;
  customer?: { id: string; name: string; email: string };
  customerName?: string;
  customerEmail?: string;
  tagIds?: string[];
  tags?: { id: string; name: string; color?: string }[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketListResponse {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  categoryId?: string;
  agentId?: string;
  customerId?: string;
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: string;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly tickets = signal<Ticket[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly currentTicket = signal<Ticket | null>(null);
  readonly ticketLoading = signal(false);
  readonly ticketError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  list(filters: TicketFilters = {}): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.agentId) params = params.set('agentId', filters.agentId);
    if (filters.q) params = params.set('q', filters.q);
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortDir) params = params.set('sortDir', filters.sortDir);

    this.http.get<TicketListResponse>('/api/tickets', { params }).pipe(
      tap(res => {
        this.tickets.set(res.data);
        this.total.set(res.total);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Failed to load tickets');
        return of(undefined);
      })
    ).subscribe();
  }

  getById(id: string): void {
    this.ticketLoading.set(true);
    this.ticketError.set(null);
    this.currentTicket.set(null);

    this.http.get<Ticket>(`/api/tickets/${id}`).pipe(
      tap(ticket => {
        this.currentTicket.set(ticket);
        this.ticketLoading.set(false);
      }),
      catchError(err => {
        this.ticketLoading.set(false);
        this.ticketError.set(err.error?.message || err.message || 'Ticket not found');
        return of(undefined);
      })
    ).subscribe();
  }

  create(data: Partial<Ticket>): Observable<Ticket> {
    this.saving.set(true);
    this.saveError.set(null);
    return this.http.post<Ticket>('/api/tickets', data).pipe(
      tap(() => this.saving.set(false)),
      catchError(err => {
        this.saving.set(false);
        this.saveError.set(err.error?.message || err.message || 'Failed to create ticket');
        throw err;
      })
    );
  }

  update(id: string, data: Partial<Ticket>): Observable<Ticket> {
    this.saving.set(true);
    this.saveError.set(null);
    return this.http.patch<Ticket>(`/api/tickets/${id}`, data).pipe(
      tap(() => this.saving.set(false)),
      catchError(err => {
        this.saving.set(false);
        this.saveError.set(err.error?.message || err.message || 'Failed to update ticket');
        throw err;
      })
    );
  }

  updateStatus(id: string, status: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`/api/tickets/${id}/status`, { status });
  }

  assign(id: string, agentId: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`/api/tickets/${id}/assign`, { agentId });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tickets/${id}`);
  }
}
