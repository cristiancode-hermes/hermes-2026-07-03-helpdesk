import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketMessage } from '../common/entities/ticket-message.entity';
import { Ticket } from '../common/entities/ticket.entity';
import { AuditEvent } from '../common/entities/audit-event.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(TicketMessage)
    private readonly messageRepo: Repository<TicketMessage>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(AuditEvent)
    private readonly auditRepo: Repository<AuditEvent>,
  ) {}

  async findByTicket(ticketId: number, organizationId: number) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, organizationId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.messageRepo.find({
      where: { ticketId },
      relations: { user: true, customer: true },
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    ticketId: number,
    dto: CreateMessageDto,
    organizationId: number,
    userId: number,
  ) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, organizationId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const authorType = dto.authorType || 'agent';

    const message = this.messageRepo.create({
      ticketId,
      userId: authorType === 'agent' ? userId : null,
      content: dto.content,
      isInternal: dto.isInternal || false,
      authorType,
    });
    const savedMessage = await this.messageRepo.save(message);

    // Create audit event
    const audit = this.auditRepo.create({
      ticketId,
      userId,
      action: 'message_added',
    });
    await this.auditRepo.save(audit);

    // Auto-change ticket from 'new' to 'open' if agent sends message
    if (ticket.status === 'new' && authorType === 'agent') {
      ticket.status = 'open';
      await this.ticketRepo.save(ticket);

      const statusAudit = this.auditRepo.create({
        ticketId,
        userId,
        action: 'status_changed',
        oldValue: 'new',
        newValue: 'open',
      });
      await this.auditRepo.save(statusAudit);
    }

    return this.messageRepo.findOne({
      where: { id: savedMessage.id },
      relations: { user: true, customer: true },
    });
  }
}
