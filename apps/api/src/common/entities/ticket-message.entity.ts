import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from './user.entity';
import { Customer } from './customer.entity';

@Entity('ticket_messages')
export class TicketMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticketId: number;

  @ManyToOne(() => Ticket, t => t.messages)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column('int', { nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column('int', { nullable: true })
  customerId: number | null;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer | null;

  @Column('text')
  content: string;

  @Column({ default: false })
  isInternal: boolean;

  @Column()
  authorType: string; // agent | customer | system

  @CreateDateColumn()
  createdAt: Date;
}
