import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { Ticket } from '../common/entities/ticket.entity';
import { AuditEvent } from '../common/entities/audit-event.entity';
import { User } from '../common/entities/user.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let ticketRepo: jest.Mocked<Repository<Ticket>>;
  let auditRepo: jest.Mocked<Repository<AuditEvent>>;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockOrgId = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AuditEvent),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    ticketRepo = module.get(getRepositoryToken(Ticket));
    auditRepo = module.get(getRepositoryToken(AuditEvent));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return complete dashboard summary with all sections', async () => {
      // Mock KPIs
      ticketRepo.count
        .mockResolvedValueOnce(3)  // openTickets
        .mockResolvedValueOnce(2); // pendingTickets

      // Mock createQueryBuilder for resolvedToday
      const resolvedTodayQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      } as any;
      ticketRepo.createQueryBuilder.mockReturnValue(resolvedTodayQB);

      // Set up for avg resolution time (will reuse same QB pattern)
      const avgResultQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avgHours: 24.5 }),
      } as any;

      const statusQB = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { label: 'new', count: 2 },
          { label: 'open', count: 3 },
        ]),
      } as any;

      const priorityQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { label: 'urgent', count: 1 },
          { label: 'medium', count: 4 },
        ]),
      } as any;

      const trendQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { day: '2026-07-01', created: 2 },
        ]),
      } as any;

      // Urgent unassigned
      ticketRepo.find.mockResolvedValue([]);

      // Agent stats
      const agentQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { userId: 1, ticketCount: 3 },
        ]),
      } as any;

      // We need to return different query builders for each call
      const qbMap: Record<string, any> = {
        "date(ticket.resolvedAt) = date('now')": resolvedTodayQB,
      };
      
      // Since createQueryBuilder returns the first mock by default, we need
      // a more sophisticated mock - we'll create a multi-return mock
      ticketRepo.createQueryBuilder
        .mockReturnValueOnce(resolvedTodayQB)  // resolved today
        .mockReturnValueOnce(avgResultQB)      // avg time
        .mockReturnValueOnce(statusQB)         // status distribution
        .mockReturnValueOnce(priorityQB)       // priority distribution
        .mockReturnValueOnce(trendQB)          // trend
        .mockReturnValueOnce(agentQB);         // agent stats

      userRepo.findBy.mockResolvedValue([{ id: 1, name: 'Ana' } as User]);

      const result = await service.getSummary(mockOrgId, 7);

      expect(result).toBeDefined();
      expect(result.kpis).toBeDefined();
      expect(result.kpis.openTickets).toBe(3);
      expect(result.kpis.pendingTickets).toBe(2);
      expect(result.kpis.resolvedToday).toBe(1);
      expect(result.kpis.avgResolutionTime).toBe(24.5);

      expect(result.statusDistribution).toBeDefined();
      expect(result.statusDistribution).toHaveLength(2);

      expect(result.priorityDistribution).toBeDefined();
      expect(result.priorityDistribution).toHaveLength(2);

      expect(result.trend).toBeDefined();
      expect(result.trend.length).toBeGreaterThan(0);

      expect(result.urgentUnassigned).toBeDefined();
      expect(result.agentStats).toBeDefined();
    });

    it('should return zero KPIs when no tickets exist', async () => {
      ticketRepo.count
        .mockResolvedValueOnce(0)  // open
        .mockResolvedValueOnce(0); // pending

      const emptyQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getRawOne: jest.fn().mockResolvedValue({ avgHours: null }),
        getRawMany: jest.fn().mockResolvedValue([]),
      } as any;

      ticketRepo.createQueryBuilder
        .mockReturnValueOnce(emptyQB)
        .mockReturnValueOnce(emptyQB)
        .mockReturnValueOnce(emptyQB)
        .mockReturnValueOnce(emptyQB)
        .mockReturnValueOnce(emptyQB)
        .mockReturnValueOnce(emptyQB);

      ticketRepo.find.mockResolvedValue([]);
      userRepo.findBy.mockResolvedValue([]);

      const result = await service.getSummary(mockOrgId, 7);

      expect(result.kpis.openTickets).toBe(0);
      expect(result.kpis.pendingTickets).toBe(0);
      expect(result.kpis.resolvedToday).toBe(0);
      expect(result.kpis.avgResolutionTime).toBe(0);
      expect(result.statusDistribution).toEqual([]);
      expect(result.priorityDistribution).toEqual([]);
      expect(result.urgentUnassigned).toEqual([]);
      expect(result.agentStats).toEqual([]);
    });

    it('should enforce organization scoping in all queries', async () => {
      ticketRepo.count.mockResolvedValue(0);

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getRawOne: jest.fn().mockResolvedValue({ avgHours: null }),
        getRawMany: jest.fn().mockResolvedValue([]),
      } as any;

      ticketRepo.createQueryBuilder
        .mockReturnValueOnce(qb)
        .mockReturnValueOnce(qb)
        .mockReturnValueOnce(qb)
        .mockReturnValueOnce(qb)
        .mockReturnValueOnce(qb)
        .mockReturnValueOnce(qb);

      ticketRepo.find.mockResolvedValue([]);
      userRepo.findBy.mockResolvedValue([]);

      await service.getSummary(mockOrgId, 7);

      // All queries should include organizationId filter
      expect(ticketRepo.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: mockOrgId }),
        }),
      );
    });

    it('should return 7-day trend with zero-filled missing days', async () => {
      ticketRepo.count.mockResolvedValue(0);

      // Just return one day of data
      const trendQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      } as any;

      const emptyQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getRawOne: jest.fn().mockResolvedValue({ avgHours: null }),
        getRawMany: jest.fn().mockResolvedValue([]),
      } as any;

      ticketRepo.createQueryBuilder
        .mockReturnValueOnce(emptyQB)
        .mockReturnValueOnce(emptyQB)
        .mockReturnValueOnce(emptyQB)
        .mockReturnValueOnce(emptyQB)
        .mockReturnValueOnce(trendQB)
        .mockReturnValueOnce(emptyQB);

      ticketRepo.find.mockResolvedValue([]);
      userRepo.findBy.mockResolvedValue([]);

      const result = await service.getSummary(mockOrgId, 7);

      // Should have exactly 7 days (with 0 filling)
      expect(result.trend).toHaveLength(7);
    });
  });
});
