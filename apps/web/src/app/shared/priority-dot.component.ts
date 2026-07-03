import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-priority-dot',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full" [class]="dotClass()"></span>
      <span class="text-sm capitalize">{{ priority() }}</span>
    </span>
  `,
})
export class PriorityDotComponent {
  readonly priority = input.required<string>();

  protected readonly dotClass = computed(() => {
    const p = this.priority();
    switch (p) {
      case 'low': return 'bg-neutral-400';
      case 'medium': return 'bg-warning-400';
      case 'high': return 'bg-accent-500';
      case 'urgent': return 'bg-danger-500 animate-pulse';
      default: return 'bg-neutral-400';
    }
  });
}
