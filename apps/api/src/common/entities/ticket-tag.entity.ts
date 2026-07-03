import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Ticket } from './ticket.entity';
import { Tag } from './tag.entity';

@Entity('ticket_tags')
export class TicketTag {
  @PrimaryColumn()
  ticketId: number;

  @ManyToOne(() => Ticket, t => t.ticketTags)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @PrimaryColumn()
  tagId: number;

  @ManyToOne(() => Tag, t => t.ticketTags)
  @JoinColumn({ name: 'tagId' })
  tag: Tag;
}
