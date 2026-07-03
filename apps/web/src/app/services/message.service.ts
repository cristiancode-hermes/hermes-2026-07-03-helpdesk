import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean;
  isSystemEvent: boolean;
  authorId?: string;
  author?: { id: string; name: string; role: string };
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);

  readonly messages = signal<TicketMessage[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly sending = signal(false);

  list(ticketId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<TicketMessage[]>(`/api/tickets/${ticketId}/messages`).pipe(
      tap(msgs => {
        this.messages.set(msgs);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(err.error?.message || err.message || 'Failed to load messages');
        return of([]);
      })
    ).subscribe();
  }

  create(ticketId: string, content: string, isInternal: boolean): Observable<TicketMessage> {
    this.sending.set(true);
    return this.http.post<TicketMessage>(`/api/tickets/${ticketId}/messages`, { content, isInternal }).pipe(
      tap(msg => {
        this.messages.update(msgs => [...msgs, msg]);
        this.sending.set(false);
      }),
      catchError(err => {
        this.sending.set(false);
        throw err;
      })
    );
  }
}
