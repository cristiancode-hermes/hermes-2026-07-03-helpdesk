import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketsService } from './tickets.service';
import { Ticket } from '../common/entities/ticket.entity';
import { TicketTag } from '../common/entities/ticket-tag.entity';
import { AuditEvent } from '../common/entities/audit-event.entity';
import { Customer } from '../common/entities/customer.entity';
import { User } from '../common/entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketRepo: jest.Mocked<Repository<Ticket>>;
  let ticketTagRepo: jest.Mocked<Repository<TicketTag>>;
  let auditRepo: jest.Mocked<Repository<AuditEvent>>;
  let customerRepo: jest.Mocked<Repository<Customer>>;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockOrgId = 1;
  const mockUserId = 1;

  const mockTicket: Ticket = {
    id: 1,
    organizationId: mockOrgId,
    customerId: 1,
    customer: { id: 1, name: 'Test Customer', email: 'test@test.com', organizationId: mockOrgId } as Customer,
    categoryId: null,
    category: null,
    assignedToId: null,
    assignedTo: null,
    title: 'Test Ticket',
    description: 'Test Description',
    status: 'new',
    priority: 'medium',
    messages: [],
    ticketTags: [],
    auditLog: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    resolvedAt: null,
    closedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: {
            createQueryBuilder: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TicketTag),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AuditEvent),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketRepo = module.get(getRepositoryToken(Ticket));
    ticketTagRepo = module.get(getRepositoryToken(TicketTag));
    auditRepo = module.get(getRepositoryToken(AuditEvent));
    customerRepo = module.get(getRepositoryToken(Customer));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── findAll ──────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated tickets with applied filters', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockTicket]),
      } as any;
      ticketRepo.createQueryBuilder.mockReturnValue(queryBuilder);
      ticketTagRepo.find.mockResolvedValue([]);

      const result = await service.findAll(mockOrgId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(ticketRepo.createQueryBuilder).toHaveBeenCalledWith('ticket');
    });

    it('should apply status filter when provided', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([{ ...mockTicket, status: 'open' }]),
      } as any;
      ticketRepo.createQueryBuilder.mockReturnValue(queryBuilder);
      ticketTagRepo.find.mockResolvedValue([]);

      await service.findAll(mockOrgId, { status: 'open' });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('ticket.status = :status', { status: 'open' });
    });

    it('should apply text search filter', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      } as any;
      ticketRepo.createQueryBuilder.mockReturnValue(queryBuilder);
      ticketTagRepo.find.mockResolvedValue([]);

      await service.findAll(mockOrgId, { q: 'error' });

      expect(queryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a ticket when found', async () => {
      ticketRepo.findOne.mockResolvedValue(mockTicket);
      ticketTagRepo.find.mockResolvedValue([]);

      const result = await service.findOne(1, mockOrgId);

      expect(result).toEqual(mockTicket);
      expect(ticketRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, organizationId: mockOrgId },
        relations: expect.any(Object),
        order: expect.any(Object),
      });
    });

    it('should throw NotFoundException when ticket not found', async () => {
      ticketRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, mockOrgId)).rejects.toThrow(NotFoundException);
    });

    it('should NOT return ticket from another organization', async () => {
      ticketRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ───────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a ticket with existing customer', async () => {
      const dto = {
        title: 'New Ticket',
        description: 'Desc',
        priority: 'high',
        customerId: 1,
      };

      ticketRepo.create.mockReturnValue(mockTicket as any);
      ticketRepo.save.mockResolvedValue(mockTicket);
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({} as any);
      ticketTagRepo.find.mockResolvedValue([]);
      ticketRepo.findOne.mockResolvedValue(mockTicket);

      const result = await service.create(dto as any, mockOrgId, mockUserId);

      expect(ticketRepo.create).toHaveBeenCalled();
      expect(ticketRepo.save).toHaveBeenCalled();
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'created', ticketId: 1, userId: mockUserId }),
      );
      expect(result).toBeDefined();
    });

    it('should create a new customer on-the-fly when customerEmail provided', async () => {
      const dto = {
        title: 'New Ticket',
        description: 'Desc',
        customerEmail: 'new@customer.com',
        customerName: 'New Customer',
      };

      const newCustomer = { id: 2, name: 'New Customer', email: 'new@customer.com', organizationId: mockOrgId };

      customerRepo.findOne.mockResolvedValue(null); // customer doesn't exist
      customerRepo.create.mockReturnValue(newCustomer as any);
      customerRepo.save.mockResolvedValue(newCustomer as any);
      ticketRepo.findOne.mockResolvedValue(mockTicket);
      ticketRepo.create.mockReturnValue(mockTicket);
      ticketRepo.save.mockResolvedValue(mockTicket);
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({} as any);
      ticketTagRepo.find.mockResolvedValue([]);

      const result = await service.create(dto as any, mockOrgId, mockUserId);

      expect(customerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@customer.com', organizationId: mockOrgId }),
      );
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when no customer info provided', async () => {
      const dto = { title: 'No Customer', description: 'Desc' };

      await expect(service.create(dto as any, mockOrgId, mockUserId)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── changeStatus (State Machine) ─────────────────────────────────

  describe('changeStatus - State Machine', () => {
    it('should allow new -> open transition', async () => {
      const ticket = { ...mockTicket, status: 'new' };
      ticketRepo.findOne.mockResolvedValue(ticket);
      ticketRepo.save.mockResolvedValue({ ...ticket, status: 'open' });
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({} as any);
      ticketTagRepo.find.mockResolvedValue([]);

      const result = await service.changeStatus(1, { status: 'open' }, mockOrgId, mockUserId);

      expect(ticketRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should allow open -> in_progress transition', async () => {
      const ticket = { ...mockTicket, status: 'open' };
      ticketRepo.findOne.mockResolvedValue(ticket);
      ticketRepo.save.mockResolvedValue({ ...ticket, status: 'in_progress' });
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({} as any);
      ticketTagRepo.find.mockResolvedValue([]);

      const result = await service.changeStatus(1, { status: 'in_progress' }, mockOrgId, mockUserId);

      expect(result).toBeDefined();
    });

    it('should allow in_progress -> resolved transition and set resolvedAt', async () => {
      const ticket = { ...mockTicket, status: 'in_progress', resolvedAt: null };
      ticketRepo.findOne.mockResolvedValue(ticket);
      ticketRepo.save.mockImplementation(async (t: any) => {
        const saved = { ...t, resolvedAt: new Date() };
        return saved;
      });
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({} as any);
      ticketTagRepo.find.mockResolvedValue([]);

      const result = await service.changeStatus(1, { status: 'resolved' }, mockOrgId, mockUserId);

      expect(result).toBeDefined();
      expect(ticketRepo.save).toHaveBeenCalled();
      // Verify resolvedAt was set
      const saveCall = ticketRepo.save.mock.calls[0][0];
      expect(saveCall.resolvedAt).toBeInstanceOf(Date);
    });

    it('should reject new -> resolved transition', async () => {
      const ticket = { ...mockTicket, status: 'new' };
      ticketRepo.findOne.mockResolvedValue(ticket);

      await expect(
        service.changeStatus(1, { status: 'resolved' }, mockOrgId, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject closed -> in_progress transition', async () => {
      const ticket = { ...mockTicket, status: 'closed' };
      ticketRepo.findOne.mockResolvedValue(ticket);

      await expect(
        service.changeStatus(1, { status: 'in_progress' }, mockOrgId, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow closed -> open (reopen)', async () => {
      const ticket = { ...mockTicket, status: 'closed', closedAt: new Date() };
      ticketRepo.findOne.mockResolvedValue(ticket);
      ticketRepo.save.mockResolvedValue({ ...ticket, status: 'open', closedAt: null });
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({} as any);
      ticketTagRepo.find.mockResolvedValue([]);

      const result = await service.changeStatus(1, { status: 'open' }, mockOrgId, mockUserId);

      expect(result).toBeDefined();
    });

    it('should reject transition to same status', async () => {
      const ticket = { ...mockTicket, status: 'open' };
      ticketRepo.findOne.mockResolvedValue(ticket);

      await expect(
        service.changeStatus(1, { status: 'open' }, mockOrgId, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent ticket', async () => {
      ticketRepo.findOne.mockResolvedValue(null);

      await expect(
        service.changeStatus(999, { status: 'open' }, mockOrgId, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow open -> closed (direct close)', async () => {
      const ticket = { ...mockTicket, status: 'open' };
      ticketRepo.findOne.mockResolvedValue(ticket);
      ticketRepo.save.mockResolvedValue({ ...ticket, status: 'closed', closedAt: new Date() });
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({} as any);
      ticketTagRepo.find.mockResolvedValue([]);

      const result = await service.changeStatus(1, { status: 'closed' }, mockOrgId, mockUserId);

      expect(result).toBeDefined();
    });
  });

  // ─── assign ──────────────────────────────────────────────────────

  describe('assign', () => {
    it('should assign ticket to an agent', async () => {
      const ticket = { ...mockTicket, assignedToId: null };
      const agent = { id: 2, name: 'Agent', organizationId: mockOrgId } as User;

      ticketRepo.findOne.mockResolvedValue(ticket);
      userRepo.findOne.mockResolvedValue(agent);
      ticketRepo.save.mockResolvedValue({ ...ticket, assignedToId: 2 });
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({} as any);
      ticketTagRepo.find.mockResolvedValue([]);

      const result = await service.assign(1, { assignedToId: 2 }, mockOrgId, mockUserId);

      expect(ticketRepo.save).toHaveBeenCalled();
      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'assigned', newValue: '2' }),
      );
    });

    it('should throw BadRequestException when agent not in same org', async () => {
      ticketRepo.findOne.mockResolvedValue(mockTicket);
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.assign(1, { assignedToId: 99 }, mockOrgId, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent ticket', async () => {
      ticketRepo.findOne.mockResolvedValue(null);

      await expect(
        service.assign(999, { assignedToId: 2 }, mockOrgId, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ──────────────────────────────────────────────────────

  describe('update', () => {
    it('should update ticket fields and create audit events', async () => {
      const ticket = { ...mockTicket, title: 'Old Title', priority: 'low' };
      ticketRepo.findOne.mockResolvedValue(ticket);
      ticketRepo.save.mockResolvedValue({ ...ticket, title: 'New Title', priority: 'high' });
      auditRepo.create.mockReturnValue({} as any);
      auditRepo.save.mockResolvedValue({} as any);
      ticketTagRepo.find.mockResolvedValue([]);
      ticketTagRepo.delete.mockResolvedValue({} as any);

      const result = await service.update(
        1,
        { title: 'New Title', priority: 'high' } as any,
        mockOrgId,
        mockUserId,
      );

      expect(auditRepo.create).toHaveBeenCalledTimes(2); // title and priority changes
    });

    it('should throw NotFoundException for non-existent ticket', async () => {
      ticketRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { title: 'New' } as any, mockOrgId, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete a ticket', async () => {
      ticketRepo.findOne.mockResolvedValue(mockTicket);
      ticketRepo.remove.mockResolvedValue(mockTicket);

      await service.remove(1, mockOrgId);

      expect(ticketRepo.remove).toHaveBeenCalledWith(mockTicket);
    });

    it('should throw NotFoundException for non-existent ticket', async () => {
      ticketRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999, mockOrgId)).rejects.toThrow(NotFoundException);
    });
  });
});
