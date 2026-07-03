import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { TicketTag } from './ticket-tag.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizationId: number;

  @ManyToOne(() => Organization, o => o.tags)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ default: '#737373' })
  color: string;

  @OneToMany(() => TicketTag, tt => tt.tag)
  ticketTags: TicketTag[];

  @CreateDateColumn()
  createdAt: Date;
}
