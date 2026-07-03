import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Ticket } from './ticket.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizationId: number;

  @ManyToOne(() => Organization, o => o.customers)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column('text', { nullable: true })
  phone: string | null;

  @OneToMany(() => Ticket, t => t.customer)
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;
}
