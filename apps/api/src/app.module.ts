import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { TicketsModule } from './tickets/tickets.module';
import { MessagesModule } from './messages/messages.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SearchModule } from './search/search.module';
import { SeedModule } from './seed/seed.module';
import { Organization } from './common/entities/organization.entity';
import { User } from './common/entities/user.entity';
import { Customer } from './common/entities/customer.entity';
import { Category } from './common/entities/category.entity';
import { Tag } from './common/entities/tag.entity';
import { Ticket } from './common/entities/ticket.entity';
import { TicketMessage } from './common/entities/ticket-message.entity';
import { TicketTag } from './common/entities/ticket-tag.entity';
import { AuditEvent } from './common/entities/audit-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqljs',
        location: config.get<string>('DATABASE_PATH', 'data/helpdesk.sqlite'),
        autoSave: true,
        entities: [
          Organization, User, Customer, Category, Tag,
          Ticket, TicketMessage, TicketTag, AuditEvent,
        ],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    CustomersModule,
    CategoriesModule,
    TagsModule,
    TicketsModule,
    MessagesModule,
    DashboardModule,
    SearchModule,
    SeedModule,
  ],
})
export class AppModule {}
