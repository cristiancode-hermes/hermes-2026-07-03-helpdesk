import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Customer } from './customer.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => User, u => u.organization)
  users: User[];

  @OneToMany(() => Customer, c => c.organization)
  customers: Customer[];

  @OneToMany(() => Category, c => c.organization)
  categories: Category[];

  @OneToMany(() => Tag, t => t.organization)
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;
}
