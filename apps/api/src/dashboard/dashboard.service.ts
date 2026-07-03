import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Ticket } from '../common/entities/ticket.entity';
import { AuditEvent } from '../common/entities/audit-event.entity';
import { User } from '../common/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(AuditEvent)
    private readonly auditRepo: Repository<AuditEvent>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getSummary(organizationId: number, days: number = 7) {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // KPIs
    const openTickets = await this.ticketRepo.count({
      where: { organizationId, status: 'open' },
    });

    const pendingTickets = await this.ticketRepo.count({
      where: { organizationId, status: 'in_progress' },
    });

    // Resolved today — SQLite-compatible
    const resolvedToday = await this.ticketRepo
      .createQueryBuilder('ticket')
      .where('ticket.organizationId = :orgId', { orgId: organizationId })
      .andWhere('ticket.status = :status', { status: 'resolved' })
      .andWhere("date(ticket.resolvedAt) = date('now')")
      .getCount();

    // Average resolution time (hours) — SQLite-compatible
    const avgResult = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select(
        "COALESCE(AVG((strftime('%s', ticket.resolvedAt) - strftime('%s', ticket.createdAt)) / 3600.0), 0)",
        'avgHours',
      )
      .where('ticket.organizationId = :orgId', { orgId: organizationId })
      .andWhere('ticket.status = :status', { status: 'resolved' })
      .andWhere('ticket.resolvedAt IS NOT NULL')
      .getRawOne();

    const avgResolutionTime = avgResult?.avgHours
      ? Math.round(Number(avgResult.avgHours) * 100) / 100
      : 0;

    // Status distribution
    const statusRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket.status', 'label')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.organizationId = :orgId', { orgId: organizationId })
      .groupBy('ticket.status')
      .getRawMany();

    const statusColors: Record<string, string> = {
      new: '#6366f1',
      open: '#818cf8',
      in_progress: '#f97316',
      resolved: '#22c55e',
      closed: '#737373',
    };

    const statusDistribution = statusRaw.map((s: any) => ({
      label: s.label,
      count: Number(s.count),
      color: statusColors[s.label] || '#737373',
    }));

    // Priority distribution (only active tickets)
    const priorityRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket.priority', 'label')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.organizationId = :orgId', { orgId: organizationId })
      .andWhere("ticket.status NOT IN ('resolved', 'closed')")
      .groupBy('ticket.priority')
      .getRawMany();

    const priorityColors: Record<string, string> = {
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#eab308',
      low: '#22c55e',
    };

    const priorityDistribution = priorityRaw.map((p: any) => ({
      label: p.label,
      count: Number(p.count),
      color: priorityColors[p.label] || '#737373',
    }));

    // Trend — daily created tickets (last N days)
    const trendRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select("date(ticket.createdAt)", 'day')
      .addSelect('COUNT(*)', 'created')
      .where('ticket.organizationId = :orgId', { orgId: organizationId })
      .andWhere('ticket.createdAt >= :startDate', { startDate })
      .groupBy("date(ticket.createdAt)")
      .orderBy("date(ticket.createdAt)", 'ASC')
      .getRawMany();

    // Fill missing days
    const trendMap = new Map<string, { created: number; resolved: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      trendMap.set(key, { created: 0, resolved: 0 });
    }

    for (const row of trendRaw) {
      const day = String(row.day).split('T')[0];
      if (trendMap.has(day)) {
        trendMap.set(day, {
          created: Number(row.created || 0),
          resolved: 0,
        });
      }
    }

    const trend = Array.from(trendMap.entries()).map(([day, data]) => ({
      day,
      ...data,
    }));

    // Urgent unassigned tickets
    const tickets = await this.ticketRepo.find({
      where: { organizationId, priority: 'urgent', assignedToId: null } as any,
      relations: { customer: true, category: true },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const urgentUnassigned = tickets.filter(
      (t) => !['resolved', 'closed'].includes(t.status),
    );

    // Agent stats
    const agentRaw = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket.assignedToId', 'userId')
      .addSelect('COUNT(*)', 'ticketCount')
      .where('ticket.organizationId = :orgId', { orgId: organizationId })
      .andWhere('ticket.assignedToId IS NOT NULL')
      .groupBy('ticket.assignedToId')
      .getRawMany();

    const agentIds = agentRaw.map((a: any) => Number(a.userId));
    const agents = agentIds.length > 0
      ? await this.userRepo.findBy({ id: In(agentIds) })
      : [];
    const agentMap = new Map(agents.map((a) => [a.id, a.name]));

    const agentStats = agentRaw.map((a: any) => ({
      agentName: agentMap.get(Number(a.userId)) || `User #${a.userId}`,
      ticketCount: Number(a.ticketCount),
    }));

    return {
      kpis: { openTickets, pendingTickets, resolvedToday, avgResolutionTime },
      statusDistribution,
      priorityDistribution,
      trend,
      urgentUnassigned,
      agentStats,
    };
  }
}
