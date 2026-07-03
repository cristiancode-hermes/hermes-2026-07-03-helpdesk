import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('tickets/:ticketId/messages')
  @ApiOperation({ summary: 'List messages for a ticket' })
  findByTicket(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.findByTicket(ticketId, user.organizationId);
  }

  @Post('tickets/:ticketId/messages')
  @ApiOperation({ summary: 'Add a message to a ticket' })
  create(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.create(ticketId, dto, user.organizationId, user.id);
  }
}
