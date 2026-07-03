import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TicketMessage } from '../common/entities/ticket-message.entity';
import { Ticket } from '../common/entities/ticket.entity';
import { AuditEvent } from '../common/entities/audit-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketMessage, Ticket, AuditEvent]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
