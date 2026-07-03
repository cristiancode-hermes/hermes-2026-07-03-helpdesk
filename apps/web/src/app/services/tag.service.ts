import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class TagService {
  private http = inject(HttpClient);

  readonly tags = signal<Tag[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.list();
  }

  list(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Tag[]>('/api/tags').pipe(
      tap(tags => {
        this.tags.set(tags);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Failed to load tags');
        return of([]);
      })
    ).subscribe();
  }

  create(data: { name: string; color?: string }): Observable<Tag> {
    return this.http.post<Tag>('/api/tags', data).pipe(
      tap(tag => this.tags.update(tags => [...tags, tag]))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tags/${id}`).pipe(
      tap(() => this.tags.update(tags => tags.filter(t => t.id !== id)))
    );
  }
}
