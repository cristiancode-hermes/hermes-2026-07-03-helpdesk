import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organizationId: string;
  ticketCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly customers = signal<Customer[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly currentCustomer = signal<Customer | null>(null);
  readonly customerLoading = signal(false);
  readonly customerError = signal<string | null>(null);
  readonly customerTickets = signal<any[]>([]);

  list(q?: string, page = 1, limit = 20): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams().set('page', page).set('limit', limit);
    if (q) params = params.set('q', q);

    this.http.get<CustomerListResponse>('/api/customers', { params }).pipe(
      tap(res => {
        this.customers.set(res.data);
        this.total.set(res.total);
        this.page.set(res.page);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Failed to load customers');
        return of(undefined);
      })
    ).subscribe();
  }

  getById(id: string): void {
    this.customerLoading.set(true);
    this.customerError.set(null);
    this.currentCustomer.set(null);

    this.http.get<Customer>(`/api/customers/${id}`).pipe(
      tap(c => {
        this.currentCustomer.set(c);
        this.customerLoading.set(false);
      }),
      catchError(err => {
        this.customerLoading.set(false);
        this.customerError.set(err.error?.message || err.message || 'Customer not found');
        return of(undefined);
      })
    ).subscribe();
  }

  create(data: { name: string; email: string; phone?: string }): Observable<Customer> {
    return this.http.post<Customer>('/api/customers', data);
  }

  update(id: string, data: Partial<Customer>): Observable<Customer> {
    return this.http.patch<Customer>(`/api/customers/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/customers/${id}`);
  }

  search(q: string): Observable<Customer[]> {
    const params = new HttpParams().set('q', q).set('limit', '10');
    return this.http.get<CustomerListResponse>('/api/customers', { params }).pipe(
      map(res => res.data),
      catchError(() => of([]))
    );
  }
}
