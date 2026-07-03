import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/button.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-950">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-600" style="font-family: 'Inter', sans-serif;">HelpDesk</h1>
          <p class="text-neutral-500 dark:text-neutral-400 mt-2">Sign in to your account</p>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-6 space-y-5">
          @if (error()) {
            <div class="bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 text-sm px-4 py-3 rounded-lg">
              {{ error() }}
            </div>
          }

          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              placeholder="you@company.com"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              placeholder="••••••••"
              (keydown.enter)="onLogin()"
              class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          <app-button variant="primary" class="w-full" [loading]="loading()" (click)="onLogin()">
            Sign in
          </app-button>
        </div>

        <p class="text-center mt-6 text-sm text-neutral-500">
          Don't have an account?
          <a routerLink="/register" class="text-primary-600 hover:text-primary-700 font-medium">Create one</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  onLogin(): void {
    if (!this.email().trim() || !this.password().trim()) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.email().trim(), this.password()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Login failed');
      },
    });
  }
}
