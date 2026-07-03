import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from '../common/entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async findAll(
    organizationId: number,
    options: { q?: string; page?: number; limit?: number } = {},
  ) {
    const { q, page = 1, limit = 20 } = options;
    const where: any = { organizationId };

    if (q) {
      where.name = Like(`%${q}%`);
    }

    const [data, total] = await this.customerRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: number, organizationId: number) {
    const customer = await this.customerRepo.findOne({
      where: { id, organizationId },
      relations: { tickets: true },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async create(dto: CreateCustomerDto, organizationId: number) {
    const existing = await this.customerRepo.findOne({
      where: { email: dto.email, organizationId },
    });
    if (existing) {
      throw new BadRequestException('Customer with this email already exists in your organization');
    }

    const customer = this.customerRepo.create({
      ...dto,
      organizationId,
    });
    return this.customerRepo.save(customer);
  }

  async update(id: number, dto: UpdateCustomerDto, organizationId: number) {
    const customer = await this.customerRepo.findOne({
      where: { id, organizationId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }

  async remove(id: number, organizationId: number) {
    const customer = await this.customerRepo.findOne({
      where: { id, organizationId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return this.customerRepo.remove(customer);
  }
}
