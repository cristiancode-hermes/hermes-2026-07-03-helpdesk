import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Ticket } from '../common/entities/ticket.entity';
import { Customer } from '../common/entities/customer.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async search(organizationId: number, q: string, limit: number = 10) {
    if (!q || q.trim().length === 0) {
      return { tickets: [], customers: [] };
    }

    const searchTerm = `%${q}%`;

    const tickets = await this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.customer', 'customer')
      .where('ticket.organizationId = :orgId', { orgId: organizationId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('ticket.title LIKE :q', { q: searchTerm })
            .orWhere('ticket.description LIKE :q', { q: searchTerm })
            .orWhere('CAST(ticket.id AS TEXT) LIKE :q', { q: searchTerm });
        }),
      )
      .orderBy('ticket.createdAt', 'DESC')
      .take(limit)
      .getMany();

    const customers = await this.customerRepo
      .createQueryBuilder('customer')
      .where('customer.organizationId = :orgId', { orgId: organizationId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('customer.name LIKE :q', { q: searchTerm })
            .orWhere('customer.email LIKE :q', { q: searchTerm });
        }),
      )
      .orderBy('customer.name', 'ASC')
      .take(limit)
      .getMany();

    return { tickets, customers };
  }
}
