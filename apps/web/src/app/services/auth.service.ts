import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, tap, catchError, of } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  organizationId: string;
  organizationName?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this.me().subscribe();
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this.currentUser.set(res.user);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Login failed');
        throw err;
      })
    );
  }

  register(name: string, email: string, password: string, organizationName: string): Observable<any> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.post('/api/auth/register', { name, email, password, organizationName }).pipe(
      tap(() => this.loading.set(false)),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Registration failed');
        throw err;
      })
    );
  }

  me(): Observable<User> {
    return this.http.get<User>('/api/auth/me').pipe(
      tap(user => this.currentUser.set(user)),
      catchError(() => {
        this.logout();
        return of({} as User);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
