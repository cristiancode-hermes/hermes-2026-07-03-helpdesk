import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(organizationId: number): Promise<User[]> {
    return this.userRepo.find({
      where: { organizationId },
      select: { id: true, name: true, email: true, role: true, organizationId: true, createdAt: true },
    });
  }

  async updateRole(id: number, role: string, currentUser: User): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException('Cannot modify users from other organizations');
    }
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can change roles');
    }

    user.role = role;
    return this.userRepo.save(user);
  }
}
