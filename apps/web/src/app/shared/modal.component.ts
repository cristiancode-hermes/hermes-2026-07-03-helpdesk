import { Component, input, output, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="fixed inset-0 bg-black/50" (click)="close.emit()"></div>
        <div class="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal w-full animate-slide-up"
          [class]="sizeClass()">
          @if (showClose()) {
            <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{{ title() }}</h3>
              <button (click)="close.emit()" class="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          }
          <div class="px-6 py-4">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly isOpen = input(false);
  readonly title = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly showClose = input(true);
  readonly close = output<void>();

  protected readonly sizeClass = () => {
    const s = this.size();
    switch (s) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
    }
  };

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}
