import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TicketService } from '../../services/ticket.service';
import { MessageService, TicketMessage } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { BadgeComponent } from '../../shared/badge.component';
import { PriorityDotComponent } from '../../shared/priority-dot.component';
import { ButtonComponent } from '../../shared/button.component';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/error-state.component';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [FormsModule, DatePipe, BadgeComponent, PriorityDotComponent, ButtonComponent, LoadingSkeletonComponent, ErrorStateComponent, ModalComponent],
  template: `
    @if (ticketService.ticketLoading()) {
      <div class="space-y-4">
        <div class="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 animate-pulse"></div>
        <app-loading-skeleton type="card" [count]="2" />
        <app-loading-skeleton type="table" [count]="4" />
      </div>
    } @else if (ticketService.ticketError(); as err) {
      <app-error-state [message]="err" (retry)="loadTicket()" />
    } @else if (ticket(); as t) {
      <!-- Header -->
      <div class="space-y-6">
        <!-- Back + Actions -->
        <div class="flex items-center justify-between">
          <button (click)="router.navigate(['/tickets'])" class="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7l-7-7 7-7"></path>
            </svg>
            Back to Tickets
          </button>
          <div class="flex items-center gap-2">
            <app-button variant="ghost" size="sm" (click)="router.navigate(['/tickets', t.id, 'edit'])">Edit</app-button>
            <app-button variant="danger" size="sm" [loading]="deleting()" (click)="confirmDelete.set(true)">Delete</app-button>
          </div>
        </div>

        <!-- Ticket Info Card -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-6">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-sm font-mono text-neutral-400">#{{ t.ticketNumber }}</span>
                <app-badge [label]="t.status" [color]="statusColor(t.status)" />
                <app-priority-dot [priority]="t.priority" />
              </div>
              <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">{{ t.title }}</h1>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <!-- Status machine -->
              @if (t.status === 'open') {
                <app-button variant="primary" size="sm" (click)="changeStatus('pending')">Mark Pending</app-button>
                <app-button variant="success" size="sm" (click)="changeStatus('resolved')">Resolve</app-button>
              } @else if (t.status === 'pending') {
                <app-button variant="primary" size="sm" (click)="changeStatus('open')">Reopen</app-button>
                <app-button variant="success" size="sm" (click)="changeStatus('resolved')">Resolve</app-button>
              } @else if (t.status === 'resolved') {
                <app-button variant="secondary" size="sm" (click)="changeStatus('open')">Reopen</app-button>
                <app-button variant="ghost" size="sm" (click)="changeStatus('closed')">Close</app-button>
              }
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div>
              <p class="text-xs text-neutral-500 uppercase tracking-wider">Category</p>
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ t.category?.name || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-neutral-500 uppercase tracking-wider">Assigned To</p>
              <div class="flex items-center gap-2 mt-1">
                @if (t.agent) {
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ t.agent.name }}</p>
                }
                <button (click)="showAssignModal.set(true)" class="text-xs text-primary-600 hover:text-primary-700">
                  {{ t.agent ? 'Reassign' : 'Assign' }}
                </button>
              </div>
            </div>
            <div>
              <p class="text-xs text-neutral-500 uppercase tracking-wider">Customer</p>
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ t.customer?.name || t.customerName || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-neutral-500 uppercase tracking-wider">SLA / Created</p>
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">{{ slaElapsed() }}</p>
            </div>
          </div>

          @if (t.description) {
            <div class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p class="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{{ t.description }}</p>
            </div>
          } @else {
            <div class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p class="text-sm text-neutral-400 italic">No description provided</p>
            </div>
          }
        </div>

        <!-- Conversation -->
        <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-card overflow-hidden">
          <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Conversation</h3>
          </div>

          <div class="px-6 py-4 max-h-[500px] overflow-y-auto space-y-4" #conversationContainer>
            @if (messageService.loading()) {
              <app-loading-skeleton type="text" [count]="3" />
            } @else {
              @for (msg of messageService.messages(); track msg.id) {
                @if (msg.isSystemEvent) {
                  <!-- System event -->
                  <div class="text-center py-2">
                    <span class="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-3 py-1 rounded-full">{{ msg.content }}</span>
                  </div>
                } @else if (msg.isInternal) {
                  <!-- Internal note -->
                  <div class="flex justify-center">
                    <div class="max-w-lg w-full border-2 border-dashed border-warning-300 dark:border-warning-700 bg-warning-50 dark:bg-warning-900/20 rounded-lg px-4 py-3">
                      <div class="flex items-center gap-2 mb-1">
                        <svg class="w-3.5 h-3.5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        <span class="text-xs font-medium text-warning-700 dark:text-warning-300">Internal note</span>
                        <span class="text-xs text-warning-500 ml-auto">{{ msg.author?.name || 'System' }}</span>
                      </div>
                      <p class="text-sm text-warning-800 dark:text-warning-200 whitespace-pre-wrap">{{ msg.content }}</p>
                    </div>
                  </div>
                } @else {
                  <!-- Regular message -->
                  <div class="flex" [class]="isAgentMessage(msg) ? 'justify-end' : 'justify-start'">
                    <div class="max-w-lg rounded-lg px-4 py-3"
                      [class]="isAgentMessage(msg) ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-sm'">
                      @if (!isAgentMessage(msg)) {
                        <p class="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">{{ msg.author?.name || 'Customer' }}</p>
                      }
                      <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                      <p class="text-xs mt-1 opacity-60">{{ msg.createdAt | date:'MMM d, h:mm a' }}</p>
                    </div>
                  </div>
                }
              } @empty {
                <div class="text-center py-8 text-sm text-neutral-500">No messages yet</div>
              }
            }
          </div>

          <!-- Message Form -->
          <div class="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <div class="flex items-start gap-3">
              <div class="flex-1">
                <textarea
                  [(ngModel)]="newMessage"
                  (keydown.enter)="onKeydown($event)"
                  placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                  rows="2"
                  class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                ></textarea>
                <label class="flex items-center gap-2 mt-2 text-sm text-neutral-500">
                  <input type="checkbox" [(ngModel)]="isInternalNote" class="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                  Internal note (agents only)
                </label>
              </div>
              <app-button variant="primary" [loading]="messageService.sending()" (click)="sendMessage()" class="shrink-0">
                Send
              </app-button>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <app-error-state message="Ticket not found" />
    }

    <!-- Assign Modal -->
    <app-modal [isOpen]="showAssignModal()" title="Assign Ticket" (close)="showAssignModal.set(false)">
      <div class="space-y-3">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Select an agent to assign this ticket to:</p>
        <div class="space-y-1 max-h-60 overflow-y-auto">
          @for (u of userService.users(); track u.id) {
            <button (click)="assignAgent(u.id)" 
              class="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm text-neutral-700 dark:text-neutral-300 transition-colors">
              {{ u.name }} <span class="text-neutral-400">({{ u.role }})</span>
            </button>
          }
        </div>
      </div>
    </app-modal>

    <!-- Delete Confirmation -->
    <app-modal [isOpen]="confirmDelete()" title="Delete Ticket" size="sm" (close)="confirmDelete.set(false)">
      <div class="space-y-4">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Are you sure you want to delete this ticket? This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <app-button variant="secondary" (click)="confirmDelete.set(false)">Cancel</app-button>
          <app-button variant="danger" [loading]="deleting()" (click)="deleteTicket()">Delete</app-button>
        </div>
      </div>
    </app-modal>
  `,
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly ticketService = inject(TicketService);
  readonly messageService = inject(MessageService);
  readonly userService = inject(UserService);
  readonly authService = inject(AuthService);

  readonly newMessage = signal('');
  readonly isInternalNote = signal(false);
  readonly deleting = signal(false);
  readonly confirmDelete = signal(false);
  readonly showAssignModal = signal(false);

  private ticketId: string | null = null;

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id');
    if (this.ticketId) {
      this.loadTicket();
    }
  }

  protected get ticket() { return this.ticketService.currentTicket; }

  loadTicket(): void {
    if (!this.ticketId) return;
    this.ticketService.getById(this.ticketId);
    this.messageService.list(this.ticketId);
  }

  protected isAgentMessage(msg: TicketMessage): boolean {
    const user = this.authService.currentUser();
    return msg.author?.role === 'admin' || msg.author?.role === 'agent' || msg.authorId === user?.id;
  }

  protected changeStatus(status: string): void {
    if (!this.ticketId) return;
    this.ticketService.updateStatus(this.ticketId, status).subscribe(() => {
      this.loadTicket();
    });
  }

  protected assignAgent(agentId: string): void {
    if (!this.ticketId) return;
    this.ticketService.assign(this.ticketId, agentId).subscribe(() => {
      this.loadTicket();
      this.showAssignModal.set(false);
    });
  }

  protected sendMessage(): void {
    if (!this.ticketId || !this.newMessage().trim()) return;
    this.messageService.create(this.ticketId, this.newMessage().trim(), this.isInternalNote()).subscribe({
      next: () => this.newMessage.set(''),
      error: () => {},
    });
  }

  protected onKeydown(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.sendMessage();
    }
  }

  protected deleteTicket(): void {
    if (!this.ticketId) return;
    this.deleting.set(true);
    this.ticketService.delete(this.ticketId).subscribe({
      next: () => this.router.navigate(['/tickets']),
      error: () => {
        this.deleting.set(false);
        this.confirmDelete.set(false);
      },
    });
  }

  protected slaElapsed(): string {
    const t = this.ticket();
    if (!t) return '';
    const created = new Date(t.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHrs > 24) return `${Math.floor(diffHrs / 24)}d ${diffHrs % 24}h ago`;
    if (diffHrs > 0) return `${diffHrs}h ${diffMins}m ago`;
    return `${diffMins}m ago`;
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
