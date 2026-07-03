import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './auth.service';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.list();
  }

  list(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<User[]>('/api/users').pipe(
      tap(users => {
        this.users.set(users);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Failed to load users');
        return of([]);
      })
    ).subscribe();
  }

  updateRole(id: string, role: string): Observable<User> {
    return this.http.patch<User>(`/api/users/${id}/role`, { role }).pipe(
      tap(updated => this.users.update(users => users.map(u => u.id === id ? updated : u)))
    );
  }
}
