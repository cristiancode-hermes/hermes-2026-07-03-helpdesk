import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../common/entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll(organizationId: number): Promise<Tag[]> {
    return this.tagRepo.find({
      where: { organizationId },
      order: { name: 'ASC' },
    });
  }

  async create(dto: CreateTagDto, organizationId: number): Promise<Tag> {
    const tag = this.tagRepo.create({
      ...dto,
      organizationId,
    });
    return this.tagRepo.save(tag);
  }

  async remove(id: number, organizationId: number): Promise<void> {
    const tag = await this.tagRepo.findOne({ where: { id, organizationId } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    await this.tagRepo.remove(tag);
  }
}
