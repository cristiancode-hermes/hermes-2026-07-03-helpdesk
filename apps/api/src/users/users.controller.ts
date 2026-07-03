import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';
import { IsString, IsIn } from 'class-validator';

class UpdateRoleDto {
  @IsString()
  @IsIn(['admin', 'agent'])
  role: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List agents in current organization' })
  findAll(@CurrentUser() user: User) {
    return this.usersService.findAll(user.organizationId);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Change user role' })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.updateRole(id, dto.role, currentUser);
  }
}
