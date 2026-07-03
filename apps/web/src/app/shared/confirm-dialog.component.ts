import { Component, input, output } from '@angular/core';
import { ModalComponent } from './modal.component';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <app-modal [isOpen]="isOpen()" [title]="title()" size="sm" (close)="cancel.emit()">
      <div class="space-y-4">
        <p class="text-neutral-600 dark:text-neutral-400">{{ message() }}</p>
        @if (detail()) {
          <p class="text-sm text-neutral-500 dark:text-neutral-500">{{ detail() }}</p>
        }
        <div class="flex justify-end gap-3 pt-2">
          <app-button variant="secondary" (click)="cancel.emit()">{{ cancelLabel() }}</app-button>
          <app-button [variant]="confirmVariant()" (click)="confirm.emit()">{{ confirmLabel() }}</app-button>
        </div>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialogComponent {
  readonly isOpen = input(false);
  readonly title = input('Confirm');
  readonly message = input('Are you sure?');
  readonly detail = input('');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly confirmVariant = input<'primary' | 'danger'>('danger');
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
