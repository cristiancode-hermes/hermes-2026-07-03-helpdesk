import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../common/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(organizationId: number): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { organizationId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number, organizationId: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, organizationId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async create(dto: CreateCategoryDto, organizationId: number): Promise<Category> {
    const category = this.categoryRepo.create({
      ...dto,
      organizationId,
    });
    return this.categoryRepo.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto, organizationId: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, organizationId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: number, organizationId: number): Promise<void> {
    const category = await this.categoryRepo.findOne({
      where: { id, organizationId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.categoryRepo.remove(category);
  }
}
