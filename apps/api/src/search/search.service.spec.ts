import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchService } from './search.service';
import { Ticket } from '../common/entities/ticket.entity';
import { Customer } from '../common/entities/customer.entity';

describe('SearchService', () => {
  let service: SearchService;
  let ticketRepo: jest.Mocked<Repository<Ticket>>;
  let customerRepo: jest.Mocked<Repository<Customer>>;

  const mockOrgId = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    ticketRepo = module.get(getRepositoryToken(Ticket));
    customerRepo = module.get(getRepositoryToken(Customer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return empty results for empty query', async () => {
      const result = await service.search(mockOrgId, '', 10);
      expect(result).toEqual({ tickets: [], customers: [] });
    });

    it('should return empty results for whitespace-only query', async () => {
      const result = await service.search(mockOrgId, '   ', 10);
      expect(result).toEqual({ tickets: [], customers: [] });
    });

    it('should search tickets by title, description, or ID', async () => {
      const ticketQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1, title: 'Error en login' }]),
      } as any;

      const customerQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any;

      ticketRepo.createQueryBuilder.mockReturnValue(ticketQB);
      customerRepo.createQueryBuilder.mockReturnValue(customerQB);

      const result = await service.search(mockOrgId, 'error', 10);

      expect(result.tickets).toHaveLength(1);
      expect(result.tickets[0].title).toBe('Error en login');
      expect(ticketRepo.createQueryBuilder).toHaveBeenCalledWith('ticket');
    });

    it('should search customers by name and email', async () => {
      const ticketQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any;

      const customerQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 1, name: 'Carlos', email: 'carlos@test.com' },
        ]),
      } as any;

      ticketRepo.createQueryBuilder.mockReturnValue(ticketQB);
      customerRepo.createQueryBuilder.mockReturnValue(customerQB);

      const result = await service.search(mockOrgId, 'carlos', 10);

      expect(result.customers).toHaveLength(1);
      expect(customerRepo.createQueryBuilder).toHaveBeenCalledWith('customer');
    });

    it('should scope search by organizationId', async () => {
      const ticketQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any;

      const customerQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any;

      ticketRepo.createQueryBuilder.mockReturnValue(ticketQB);
      customerRepo.createQueryBuilder.mockReturnValue(customerQB);

      await service.search(mockOrgId, 'test', 10);

      expect(ticketQB.where).toHaveBeenCalledWith('ticket.organizationId = :orgId', { orgId: mockOrgId });
      expect(customerQB.where).toHaveBeenCalledWith('customer.organizationId = :orgId', { orgId: mockOrgId });
    });

    it('should limit results', async () => {
      const ticketQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any;

      const customerQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any;

      ticketRepo.createQueryBuilder.mockReturnValue(ticketQB);
      customerRepo.createQueryBuilder.mockReturnValue(customerQB);

      await service.search(mockOrgId, 'test', 5);

      expect(ticketQB.take).toHaveBeenCalledWith(5);
      expect(customerQB.take).toHaveBeenCalledWith(5);
    });
  });
});
