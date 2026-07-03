import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TicketService } from '../services/ticket.service';
import { MessageService } from '../services/message.service';
import { BadgeComponent } from '../shared/badge.component';
import { ButtonComponent } from '../shared/button.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';

@Component({
  selector: 'app-customer-ticket-detail',
  standalone: true,
  imports: [FormsModule, DatePipe, BadgeComponent, ButtonComponent, LoadingSkeletonComponent],
  template: `
    @if (ticketService.ticketLoading()) {
      <app-loading-skeleton type="card" [count]="1" />
      <app-loading-skeleton type="table" [count]="3" />
    } @else if (ticketService.currentTicket(); as t) {
      <button (click)="router.navigate(['/portal/tickets'])" class="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7l-7-7 7-7"></path>
        </svg>
        Back to My Tickets
      </button>

      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-6 mb-4">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-sm font-mono text-neutral-400">#{{ t.ticketNumber }}</span>
          <app-badge [label]="t.status" [color]="statusColor(t.status)" />
        </div>
        <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{{ t.title }}</h1>
        <p class="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{{ t.description }}</p>
      </div>

      <!-- Conversation -->
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Conversation</h3>
        </div>

        <div class="px-6 py-4 max-h-96 overflow-y-auto space-y-4">
          @for (msg of messageService.messages(); track msg.id) {
            @if (msg.isSystemEvent) {
              <div class="text-center py-2">
                <span class="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-3 py-1 rounded-full">{{ msg.content }}</span>
              </div>
            } @else if (!msg.isInternal) {
              <div class="flex" [class]="msg.authorId === currentUserId ? 'justify-end' : 'justify-start'">
                <div class="max-w-lg rounded-lg px-4 py-3"
                  [class]="msg.authorId === currentUserId ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-sm'">
                  @if (msg.authorId !== currentUserId) {
                    <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">{{ msg.author?.name || 'Agent' }}</p>
                  }
                  <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                  <p class="text-xs mt-1 opacity-60">{{ msg.createdAt | date:'MMM d, h:mm a' }}</p>
                </div>
              </div>
            }
          } @empty {
            <div class="text-center py-8 text-sm text-neutral-500">No messages yet</div>
          }
        </div>

        <!-- Add comment -->
        <div class="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
          <div class="flex gap-3">
            <textarea [(ngModel)]="newComment" placeholder="Add a comment..." rows="2"
              class="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
            <app-button variant="primary" [loading]="messageService.sending()" (click)="sendComment()" class="self-end">Send</app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CustomerTicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly ticketService = inject(TicketService);
  readonly messageService = inject(MessageService);

  readonly newComment = signal('');
  protected currentUserId = '';

  private ticketId: string | null = null;

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id');
    this.currentUserId = localStorage.getItem('customerId') || '';
    if (this.ticketId) {
      this.ticketService.getById(this.ticketId);
      this.messageService.list(this.ticketId);
    }
  }

  sendComment(): void {
    if (!this.ticketId || !this.newComment().trim()) return;
    this.messageService.create(this.ticketId, this.newComment().trim(), false).subscribe({
      next: () => this.newComment.set(''),
    });
  }

  protected statusColor(status: string): string {
    switch (status) {
      case 'open': return 'primary';
      case 'pending': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'neutral';
      default: return 'neutral';
    }
  }
}
