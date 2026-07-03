import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

export interface SearchResult {
  tickets: any[];
  customers: any[];
  // plus any other types
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  readonly results = signal<SearchResult | null>(null);
  readonly loading = signal(false);
  readonly open = signal(false);

  search(q: string, limit = 10): void {
    if (!q.trim()) {
      this.results.set(null);
      return;
    }

    this.loading.set(true);
    const params = new HttpParams().set('q', q).set('limit', limit);

    this.http.get<SearchResult>('/api/search', { params }).pipe(
      tap(res => {
        this.results.set(res);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        return of(undefined);
      })
    ).subscribe();
  }

  close(): void {
    this.open.set(false);
    this.results.set(null);
  }

  openModal(): void {
    this.open.set(true);
  }
}
