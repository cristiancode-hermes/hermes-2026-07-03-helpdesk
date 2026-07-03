import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags' })
  findAll(@CurrentUser() user: User) {
    return this.tagsService.findAll(user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  create(@Body() dto: CreateTagDto, @CurrentUser() user: User) {
    return this.tagsService.create(dto, user.organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.tagsService.remove(id, user.organizationId);
  }
}
