import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignDto } from './dto/assign.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List tickets with filters and pagination' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortDir', required: false })
  findAll(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('categoryId') categoryId?: number,
    @Query('agentId') agentId?: number,
    @Query('q') q?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
  ) {
    return this.ticketsService.findAll(user.organizationId, {
      status,
      priority,
      categoryId: categoryId ? Number(categoryId) : undefined,
      agentId: agentId ? Number(agentId) : undefined,
      q,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortDir,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details with messages and audit log' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.ticketsService.findOne(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: User) {
    return this.ticketsService.create(dto, user.organizationId, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket fields' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: User,
  ) {
    return this.ticketsService.update(id, dto, user.organizationId, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change ticket status with state machine validation' })
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.ticketsService.changeStatus(id, dto, user.organizationId, user.id);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign ticket to an agent' })
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignDto,
    @CurrentUser() user: User,
  ) {
    return this.ticketsService.assign(id, dto, user.organizationId, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.ticketsService.remove(id, user.organizationId);
  }
}
