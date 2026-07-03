import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.list();
  }

  list(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Category[]>('/api/categories').pipe(
      tap(cats => {
        this.categories.set(cats);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Failed to load categories');
        return of([]);
      })
    ).subscribe();
  }

  create(data: { name: string; color: string; description?: string }): Observable<Category> {
    return this.http.post<Category>('/api/categories', data).pipe(
      tap(cat => this.categories.update(cats => [...cats, cat]))
    );
  }

  update(id: string, data: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`/api/categories/${id}`, data).pipe(
      tap(updated => this.categories.update(cats => cats.map(c => c.id === id ? updated : c)))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/categories/${id}`).pipe(
      tap(() => this.categories.update(cats => cats.filter(c => c.id !== id)))
    );
  }
}
