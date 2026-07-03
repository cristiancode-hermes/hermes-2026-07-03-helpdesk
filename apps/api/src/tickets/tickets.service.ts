import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Ticket } from '../common/entities/ticket.entity';
import { TicketTag } from '../common/entities/ticket-tag.entity';
import { AuditEvent } from '../common/entities/audit-event.entity';
import { Customer } from '../common/entities/customer.entity';
import { User } from '../common/entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignDto } from './dto/assign.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ['open'],
  open: ['in_progress', 'closed'],
  in_progress: ['resolved'],
  resolved: ['closed'],
  closed: ['open'],
};

const PRIORITY_SORT: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketTag)
    private readonly ticketTagRepo: Repository<TicketTag>,
    @InjectRepository(AuditEvent)
    private readonly auditRepo: Repository<AuditEvent>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(
    organizationId: number,
    filters: {
      status?: string;
      priority?: string;
      categoryId?: number;
      agentId?: number;
      q?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortDir?: string;
    } = {},
  ) {
    const {
      status,
      priority,
      categoryId,
      agentId,
      q,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortDir = 'DESC',
    } = filters;

    const query = this.ticketRepo.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.customer', 'customer')
      .leftJoinAndSelect('ticket.category', 'category')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
      .where('ticket.organizationId = :orgId', { orgId: organizationId });

    if (status) {
      query.andWhere('ticket.status = :status', { status });
    }

    if (priority) {
      query.andWhere('ticket.priority = :priority', { priority });
    }

    if (categoryId) {
      query.andWhere('ticket.categoryId = :categoryId', { categoryId });
    }

    if (agentId) {
      query.andWhere('ticket.assignedToId = :agentId', { agentId });
    }

    if (q) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('ticket.title LIKE :q', { q: `%${q}%` })
            .orWhere('ticket.description LIKE :q', { q: `%${q}%` })
            .orWhere('customer.name LIKE :q', { q: `%${q}%` });
        }),
      );
    }

    // For sorting by priority
    if (sortBy === 'priority') {
      // Use CASE expression in order
      const order = sortDir === 'ASC' ? 'ASC' : 'DESC';
      query.addSelect(
        `CASE ticket.priority 
          WHEN 'urgent' THEN 0 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
          ELSE 4 END`,
        'priority_sort',
      );
      query.orderBy('priority_sort', order);
    } else {
      const validSortBy = ['createdAt', 'updatedAt', 'title', 'status', 'priority'].includes(sortBy)
        ? sortBy
        : 'createdAt';
      query.orderBy(`ticket.${validSortBy}`, sortDir === 'ASC' ? 'ASC' : 'DESC');
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Load tags for each ticket
    for (const ticket of data) {
      ticket.ticketTags = await this.ticketTagRepo.find({
        where: { ticketId: ticket.id },
        relations: { tag: true },
      });
    }

    return { data, total, page, limit };
  }

  async findOne(id: number, organizationId: number): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id, organizationId },
      relations: {
        customer: true,
        category: true,
        assignedTo: true,
        messages: { user: true, customer: true },
        auditLog: true,
      },
      order: {
        messages: { createdAt: 'ASC' },
        auditLog: { createdAt: 'ASC' },
      },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Load tags
    ticket.ticketTags = await this.ticketTagRepo.find({
      where: { ticketId: ticket.id },
      relations: { tag: true },
    });

    return ticket;
  }

  async create(dto: CreateTicketDto, organizationId: number, userId: number) {
    // Resolve customer
    let customerId = dto.customerId;
    if (!customerId && dto.customerEmail) {
      let customer = await this.customerRepo.findOne({
        where: { email: dto.customerEmail, organizationId },
      });
      if (!customer) {
        customer = this.customerRepo.create({
          name: dto.customerName || dto.customerEmail,
          email: dto.customerEmail,
          organizationId,
        });
        customer = await this.customerRepo.save(customer);
      }
      customerId = customer.id;
    }
    if (!customerId) {
      throw new BadRequestException('customerId or customerEmail is required');
    }

    const ticket = this.ticketRepo.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority || 'medium',
      status: 'new',
      organizationId,
      customerId,
      categoryId: dto.categoryId || null,
      assignedToId: dto.assignedToId || null,
    });
    const savedTicket = await this.ticketRepo.save(ticket);

    // Create audit event
    const audit = this.auditRepo.create({
      ticketId: savedTicket.id,
      userId,
      action: 'created',
    });
    await this.auditRepo.save(audit);

    // Handle tags
    if (dto.tagIds && dto.tagIds.length > 0) {
      const ticketTags = dto.tagIds.map((tagId) =>
        this.ticketTagRepo.create({
          ticketId: savedTicket.id,
          tagId,
        }),
      );
      await this.ticketTagRepo.save(ticketTags);
    }

    return this.findOne(savedTicket.id, organizationId);
  }

  async update(id: number, dto: UpdateTicketDto, organizationId: number, userId: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id, organizationId } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Track changes for audit
    const changes: { field: string; oldValue: string; newValue: string }[] = [];

    if (dto.title !== undefined && dto.title !== ticket.title) {
      changes.push({ field: 'title', oldValue: ticket.title, newValue: dto.title });
      ticket.title = dto.title;
    }
    if (dto.description !== undefined) {
      ticket.description = dto.description;
    }
    if (dto.categoryId !== undefined) {
      changes.push({
        field: 'categoryId',
        oldValue: String(ticket.categoryId),
        newValue: String(dto.categoryId),
      });
      ticket.categoryId = dto.categoryId;
    }
    if (dto.priority !== undefined && dto.priority !== ticket.priority) {
      changes.push({
        field: 'priority',
        oldValue: ticket.priority,
        newValue: dto.priority,
      });
      ticket.priority = dto.priority;
    }

    await this.ticketRepo.save(ticket);

    // Handle tags
    if (dto.tagIds !== undefined) {
      // Remove existing tags
      await this.ticketTagRepo.delete({ ticketId: id });
      // Add new tags
      if (dto.tagIds.length > 0) {
        const ticketTags = dto.tagIds.map((tagId) =>
          this.ticketTagRepo.create({ ticketId: id, tagId }),
        );
        await this.ticketTagRepo.save(ticketTags);
      }
    }

    // Create audit events for changes
    for (const change of changes) {
      const audit = this.auditRepo.create({
        ticketId: id,
        userId,
        action: change.field === 'priority' ? 'priority_changed' : `${change.field}_changed`,
        oldValue: change.oldValue,
        newValue: change.newValue,
      });
      await this.auditRepo.save(audit);
    }

    return this.findOne(id, organizationId);
  }

  async changeStatus(
    id: number,
    dto: ChangeStatusDto,
    organizationId: number,
    userId: number,
  ) {
    const ticket = await this.ticketRepo.findOne({ where: { id, organizationId } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const newStatus = dto.status;
    const currentStatus = ticket.status;

    if (currentStatus === newStatus) {
      throw new BadRequestException('Ticket already has this status');
    }

    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`,
      );
    }

    const oldStatus = ticket.status;
    ticket.status = newStatus;

    if (newStatus === 'resolved') {
      ticket.resolvedAt = new Date();
    } else {
      ticket.resolvedAt = null;
    }

    if (newStatus === 'closed') {
      ticket.closedAt = new Date();
    } else {
      ticket.closedAt = null;
    }

    await this.ticketRepo.save(ticket);

    // Audit event
    const audit = this.auditRepo.create({
      ticketId: id,
      userId,
      action: newStatus === 'closed' && oldStatus !== 'resolved' ? 'reopened' : 'status_changed',
      oldValue: oldStatus,
      newValue: newStatus,
    });
    await this.auditRepo.save(audit);

    return this.findOne(id, organizationId);
  }

  async assign(id: number, dto: AssignDto, organizationId: number, userId: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id, organizationId } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const agent = await this.userRepo.findOne({
      where: { id: dto.assignedToId, organizationId },
    });
    if (!agent) {
      throw new BadRequestException('Agent not found in your organization');
    }

    const oldAgentId = ticket.assignedToId;
    ticket.assignedToId = dto.assignedToId;
    await this.ticketRepo.save(ticket);

    const audit = this.auditRepo.create({
      ticketId: id,
      userId,
      action: 'assigned',
      oldValue: oldAgentId ? String(oldAgentId) : null,
      newValue: String(dto.assignedToId),
    });
    await this.auditRepo.save(audit);

    return this.findOne(id, organizationId);
  }

  async remove(id: number, organizationId: number): Promise<void> {
    const ticket = await this.ticketRepo.findOne({ where: { id, organizationId } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    await this.ticketRepo.remove(ticket);
  }
}
