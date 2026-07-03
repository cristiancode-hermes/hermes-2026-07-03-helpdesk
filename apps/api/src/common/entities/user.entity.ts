import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Ticket } from './ticket.entity';
import { TicketMessage } from './ticket-message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizationId: number;

  @ManyToOne(() => Organization, o => o.users)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: 'agent' })
  role: string; // admin | agent

  @OneToMany(() => Ticket, t => t.assignedTo)
  assignedTickets: Ticket[];

  @OneToMany(() => TicketMessage, m => m.user)
  messages: TicketMessage[];

  @CreateDateColumn()
  createdAt: Date;
}
