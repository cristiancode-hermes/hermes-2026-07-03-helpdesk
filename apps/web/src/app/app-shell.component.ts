import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { SearchService } from './services/search.service';
import { SearchModalComponent } from './shared/search-modal.component';
import { ButtonComponent } from './shared/button.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SearchModalComponent],
  template: `
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      <!-- Sidebar -->
      <aside class="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 fixed inset-y-0 z-30">
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
          <span class="text-xl font-bold text-primary-600" style="font-family: 'Inter', sans-serif;">HelpDesk</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300" [routerLinkActiveOptions]="{exact: item.exact}"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              [class]="'text-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'">
              <span [innerHTML]="item.icon"></span>
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- User area -->
        @if (authService.currentUser(); as user) {
          <div class="px-4 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">{{ user.name.charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{{ user.name }}</p>
                <p class="text-xs text-neutral-500 truncate">{{ user.email }}</p>
              </div>
            </div>
          </div>
        }
      </aside>

      <!-- Main area -->
      <div class="flex-1 flex flex-col lg:pl-64">
        <!-- Top bar -->
        <header class="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <!-- Mobile menu button -->
          <button (click)="mobileOpen.set(!mobileOpen())" class="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <svg class="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (mobileOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              }
            </svg>
          </button>

          <!-- Search trigger -->
          <button (click)="searchService.openModal()" class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span>Search...</span>
            <kbd class="hidden lg:inline-flex px-1.5 py-0.5 text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">Ctrl+K</kbd>
          </button>

          <div class="flex items-center gap-2">
            <!-- Dark mode toggle -->
            <button (click)="themeService.toggle()" class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400" [title]="themeService.isDark() ? 'Light mode' : 'Dark mode'">
              @if (themeService.isDark()) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              }
            </button>

            <!-- User avatar dropdown -->
            <div class="relative" #userMenu>
              <button (click)="userDropdownOpen.set(!userDropdownOpen())"
                class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300 hover:ring-2 hover:ring-primary-300 transition-all">
                {{ authService.currentUser()?.name?.charAt(0) || '?' }}
              </button>
              @if (userDropdownOpen()) {
                <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-dropdown border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                  <div class="px-4 py-2 border-b border-neutral-100 dark:border-neutral-700">
                    <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ authService.currentUser()?.name }}</p>
                    <p class="text-xs text-neutral-500">{{ authService.currentUser()?.email }}</p>
                  </div>
                  <button (click)="router.navigate(['/settings']); userDropdownOpen.set(false)" class="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700">Settings</button>
                  <button (click)="logout()" class="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-neutral-50 dark:hover:bg-neutral-700">Sign out</button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 p-4 lg:p-6">
          <router-outlet />
        </main>
      </div>

      <!-- Mobile nav -->
      @if (mobileOpen()) {
        <div class="fixed inset-0 z-20 lg:hidden">
          <div class="fixed inset-0 bg-black/50" (click)="mobileOpen.set(false)"></div>
          <aside class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-neutral-900 shadow-xl animate-slide-in">
            <div class="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
              <span class="text-xl font-bold text-primary-600">HelpDesk</span>
            </div>
            <nav class="px-3 py-4 space-y-1">
              @for (item of navItems; track item.path) {
                <a [routerLink]="item.path" (click)="mobileOpen.set(false)" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <span [innerHTML]="item.icon"></span>
                  {{ item.label }}
                </a>
              }
            </nav>
          </aside>
        </div>
      }

      <!-- Search modal -->
      <app-search-modal />
    </div>
  `,
})
export class AppShellComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly searchService = inject(SearchService);
  readonly router = inject(Router);

  readonly mobileOpen = signal(false);
  readonly userDropdownOpen = signal(false);

  readonly navItems = [
    { label: 'Dashboard', path: '/dashboard', exact: true, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>' },
    { label: 'Tickets', path: '/tickets', exact: false, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>' },
    { label: 'Customers', path: '/customers', exact: false, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>' },
    { label: 'Settings', path: '/settings', exact: false, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>' },
  ];

  logout(): void {
    this.userDropdownOpen.set(false);
    this.authService.logout();
  }
}
