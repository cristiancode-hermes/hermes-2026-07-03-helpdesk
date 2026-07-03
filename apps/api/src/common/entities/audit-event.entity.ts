import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity('audit_events')
@Index(['ticketId'])
export class AuditEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticketId: number;

  @ManyToOne(() => Ticket, t => t.auditLog)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column('int', { nullable: true })
  userId: number | null;

  @Column()
  action: string; // created | status_changed | assigned | priority_changed | message_added | reopened

  @Column('text', { nullable: true })
  oldValue: string | null;

  @Column('text', { nullable: true })
  newValue: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
