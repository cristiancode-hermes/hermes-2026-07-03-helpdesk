import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { Category } from './category.entity';
import { TicketMessage } from './ticket-message.entity';
import { TicketTag } from './ticket-tag.entity';
import { AuditEvent } from './audit-event.entity';

@Entity('tickets')
@Index(['organizationId', 'status'])
@Index(['organizationId', 'priority'])
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizationId: number;

  @Column()
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column('int', { nullable: true })
  categoryId: number | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column('int', { nullable: true })
  assignedToId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User | null;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: 'new' })
  status: string; // new | open | in_progress | resolved | closed

  @Column({ default: 'medium' })
  priority: string; // low | medium | high | urgent

  @OneToMany(() => TicketMessage, m => m.ticket, { cascade: true })
  messages: TicketMessage[];

  @OneToMany(() => TicketTag, tt => tt.ticket, { cascade: true })
  ticketTags: TicketTag[];

  @OneToMany(() => AuditEvent, a => a.ticket, { cascade: true })
  auditLog: AuditEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('int', { nullable: true })
  resolvedAt: Date | null;

  @Column('int', { nullable: true })
  closedAt: Date | null;
}
