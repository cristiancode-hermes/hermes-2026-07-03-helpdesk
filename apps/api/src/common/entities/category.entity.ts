import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Ticket } from './ticket.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizationId: number;

  @ManyToOne(() => Organization, o => o.categories)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ default: '#6366f1' })
  color: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => Ticket, t => t.category)
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;
}
