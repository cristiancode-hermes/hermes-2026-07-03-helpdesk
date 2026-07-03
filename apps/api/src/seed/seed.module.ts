import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Organization } from '../common/entities/organization.entity';
import { User } from '../common/entities/user.entity';
import { Customer } from '../common/entities/customer.entity';
import { Category } from '../common/entities/category.entity';
import { Tag } from '../common/entities/tag.entity';
import { Ticket } from '../common/entities/ticket.entity';
import { TicketMessage } from '../common/entities/ticket-message.entity';
import { TicketTag } from '../common/entities/ticket-tag.entity';
import { AuditEvent } from '../common/entities/audit-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization, User, Customer, Category, Tag,
      Ticket, TicketMessage, TicketTag, AuditEvent,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
