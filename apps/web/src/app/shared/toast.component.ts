import { Component, signal, effect } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let toastId = 0;

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      @for (toast of toasts(); track toast.id) {
        <div class="rounded-lg px-4 py-3 shadow-dropdown text-white text-sm animate-slide-up flex items-center justify-between gap-3"
          [class]="typeClass(toast.type)">
          <span>{{ toast.message }}</span>
          <button (click)="dismiss(toast.id)" class="text-white/70 hover:text-white shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info', duration = 4000): void {
    const id = ++toastId;
    this.toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }

  protected typeClass(type: Toast['type']): string {
    switch (type) {
      case 'success': return 'bg-success-600';
      case 'error': return 'bg-danger-600';
      case 'warning': return 'bg-warning-500 text-neutral-900';
      case 'info': return 'bg-primary-600';
    }
  }
}
