import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from '../common/entities/ticket.entity';
import { TicketTag } from '../common/entities/ticket-tag.entity';
import { AuditEvent } from '../common/entities/audit-event.entity';
import { Customer } from '../common/entities/customer.entity';
import { User } from '../common/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketTag, AuditEvent, Customer, User]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
