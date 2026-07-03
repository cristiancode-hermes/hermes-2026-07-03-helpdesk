import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Ticket } from '../common/entities/ticket.entity';
import { Customer } from '../common/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Customer]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
