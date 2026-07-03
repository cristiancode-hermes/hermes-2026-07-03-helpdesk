import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from '../common/entities/organization.entity';
import { User } from '../common/entities/user.entity';
import { Customer } from '../common/entities/customer.entity';
import { Category } from '../common/entities/category.entity';
import { Tag } from '../common/entities/tag.entity';
import { TicketMessage } from '../common/entities/ticket-message.entity';
import { TicketTag } from '../common/entities/ticket-tag.entity';
import { AuditEvent } from '../common/entities/audit-event.entity';
import { Ticket } from '../common/entities/ticket.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketMessage)
    private readonly messageRepo: Repository<TicketMessage>,
    @InjectRepository(TicketTag)
    private readonly ticketTagRepo: Repository<TicketTag>,
    @InjectRepository(AuditEvent)
    private readonly auditRepo: Repository<AuditEvent>,
  ) {}

  async onModuleInit() {
    const existingOrgs = await this.orgRepo.count();
    if (existingOrgs > 0) {
      this.logger.log('Data already exists, skipping seed');
      return;
    }

    this.logger.log('Seeding database...');

    // 1. Organization
    const org = await this.orgRepo.save(
      this.orgRepo.create({ name: 'SoporteTech', slug: 'soportetech' }),
    );

    // 2. Users
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    const hashedPasswordAgent = await bcrypt.hash('agent123', 10);

    const anaMartinez = await this.userRepo.save(
      this.userRepo.create({
        name: 'Ana Martínez',
        email: 'ana@soportetech.com',
        password: hashedPasswordAdmin,
        role: 'admin',
        organizationId: org.id,
      }),
    );

    const carlosLopez = await this.userRepo.save(
      this.userRepo.create({
        name: 'Carlos López',
        email: 'carlos@soportetech.com',
        password: hashedPasswordAgent,
        role: 'agent',
        organizationId: org.id,
      }),
    );

    // 3. Customers
    const customersData = [
      { name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '+34 600 111 222' },
      { name: 'María García', email: 'maria.garcia@email.com', phone: '+34 600 333 444' },
      { name: 'Pedro Sánchez', email: 'pedro.sanchez@email.com', phone: '+34 600 555 666' },
      { name: 'Laura Torres', email: 'laura.torres@email.com', phone: null },
      { name: 'Empresa XYZ', email: 'info@empresaxyz.com', phone: '+34 900 123 456' },
    ];

    const customers = await this.customerRepo.save(
      customersData.map((c) =>
        this.customerRepo.create({ ...c, organizationId: org.id }),
      ),
    );

    // 4. Categories
    const categoriesData = [
      { name: 'Login/Autenticación', color: '#ef4444', description: 'Problemas de inicio de sesión y autenticación', sortOrder: 1 },
      { name: 'Facturación', color: '#f97316', description: 'Problemas de facturación y pagos', sortOrder: 2 },
      { name: 'Soporte Técnico', color: '#3b82f6', description: 'Problemas técnicos y de infraestructura', sortOrder: 3 },
      { name: 'Feature Request', color: '#8b5cf6', description: 'Solicitudes de nuevas funcionalidades', sortOrder: 4 },
      { name: 'Consulta General', color: '#10b981', description: 'Consultas generales', sortOrder: 5 },
    ];

    const categories = await this.categoryRepo.save(
      categoriesData.map((c) =>
        this.categoryRepo.create({ ...c, organizationId: org.id }),
      ),
    );

    // 5. Tags
    const tagsData = [
      { name: 'urgente', color: '#ef4444' },
      { name: 'revisión', color: '#f97316' },
      { name: 'pendiente-cliente', color: '#eab308' },
      { name: 'duplicado', color: '#6b7280' },
      { name: 'prioritario', color: '#dc2626' },
      { name: 'mejora', color: '#8b5cf6' },
      { name: 'documentación', color: '#3b82f6' },
      { name: 'error-conocido', color: '#ec4899' },
    ];

    const tags = await this.tagRepo.save(
      tagsData.map((t) =>
        this.tagRepo.create({ ...t, organizationId: org.id }),
      ),
    );

    const tagMap = new Map(tags.map((t) => [t.name, t]));

    // Create dates relative to now
    const now = new Date();
    const day = (d: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      return date;
    };

    // Helper to create ticket with all relations
    async function createTicket(
      ticketRepo: Repository<Ticket>,
      messageRepo: Repository<TicketMessage>,
      ticketTagRepo: Repository<TicketTag>,
      auditRepo: Repository<AuditEvent>,
      data: {
        title: string;
        description: string;
        status: string;
        priority: string;
        customerIdx: number;
        categoryIdx: number;
        assignedToIdx: number | null;
        daysAgo: number;
        tags: string[];
        messages: { content: string; authorType: string; userId: number | null; daysAgo: number; isInternal?: boolean }[];
      },
      orgId: number,
      customers: Customer[],
      categories: Category[],
      users: User[],
      tagMap: Map<string, Tag>,
    ) {
      const ticket = await ticketRepo.save(
        ticketRepo.create({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          organizationId: orgId,
          customerId: customers[data.customerIdx].id,
          categoryId: categories[data.categoryIdx].id,
          assignedToId: data.assignedToIdx !== null ? users[data.assignedToIdx].id : null,
          createdAt: day(data.daysAgo),
          updatedAt: day(data.daysAgo),
          resolvedAt: data.status === 'resolved' ? day(data.daysAgo - 1) : null,
          closedAt: data.status === 'closed' ? day(data.daysAgo - 1) : null,
        }),
      );

      // Create messages
      for (const msg of data.messages) {
        await messageRepo.save(
          messageRepo.create({
            ticketId: ticket.id,
            userId: msg.userId !== null ? users[msg.userId].id : null,
            content: msg.content,
            authorType: msg.authorType,
            isInternal: msg.isInternal || false,
            createdAt: day(msg.daysAgo),
          }),
        );
      }

      // Create ticket-tag relations
      for (const tagName of data.tags) {
        const tag = tagMap.get(tagName);
        if (tag) {
          await ticketTagRepo.save(
            ticketTagRepo.create({
              ticketId: ticket.id,
              tagId: tag.id,
            }),
          );
        }
      }

      // Create audit events
      await auditRepo.save(
        auditRepo.create({
          ticketId: ticket.id,
          userId: users[0].id,
          action: 'created',
          createdAt: day(data.daysAgo),
        }),
      );

      return ticket;
    }

    // 6. Tickets with messages

    // Ticket 1: New, urgent, not assigned, no messages yet
    await createTicket(
      this.ticketRepo, this.messageRepo, this.ticketTagRepo, this.auditRepo,
      {
        title: 'No puedo iniciar sesión en el panel',
        description: 'Desde esta mañana no puedo acceder al panel de administración. Me dice "Credenciales inválidas" aunque estoy seguro de que la contraseña es correcta.',
        status: 'new',
        priority: 'urgent',
        customerIdx: 0,
        categoryIdx: 0,
        assignedToIdx: null,
        daysAgo: 0,
        tags: ['urgente'],
        messages: [],
      },
      org.id, customers, categories, [anaMartinez, carlosLopez], tagMap,
    );

    // Ticket 2: Open, high, assigned to Carlos
    await createTicket(
      this.ticketRepo, this.messageRepo, this.ticketTagRepo, this.auditRepo,
      {
        title: 'Error en factura del mes de junio',
        description: 'Me ha llegado la factura de junio con un cargo incorrecto. Se me ha cobrado el doble de lo habitual.',
        status: 'open',
        priority: 'high',
        customerIdx: 1,
        categoryIdx: 1,
        assignedToIdx: 1,
        daysAgo: 2,
        tags: ['prioritario', 'revisión'],
        messages: [
          { content: 'Hola, necesito que revisen mi factura lo antes posible. Gracias.', authorType: 'customer', userId: null, daysAgo: 2 },
          { content: 'Hola María, hemos recibido tu reporte. Vamos a revisarlo con el equipo de facturación.', authorType: 'agent', userId: 1, daysAgo: 1 },
        ],
      },
      org.id, customers, categories, [anaMartinez, carlosLopez], tagMap,
    );

    // Ticket 3: In progress, medium, assigned to Ana
    await createTicket(
      this.ticketRepo, this.messageRepo, this.ticketTagRepo, this.auditRepo,
      {
        title: 'Rendimiento lento del servidor',
        description: 'El servidor de producción está respondiendo muy lento desde el mediodía. Los tiempos de carga se han duplicado.',
        status: 'in_progress',
        priority: 'medium',
        customerIdx: 2,
        categoryIdx: 2,
        assignedToIdx: 0,
        daysAgo: 3,
        tags: ['revisión', 'urgente'],
        messages: [
          { content: 'El sistema está muy lento, necesitamos una solución urgente.', authorType: 'customer', userId: null, daysAgo: 3 },
          { content: 'Estamos revisando los logs del servidor para identificar la causa.', authorType: 'agent', userId: 0, daysAgo: 2 },
          { content: '[Interno] He encontrado un pico en el uso de CPU. Escalando al equipo de infra.', authorType: 'agent', userId: 0, daysAgo: 1, isInternal: true },
          { content: 'Ya identificamos el problema. Estamos aplicando una solución.', authorType: 'agent', userId: 0, daysAgo: 0 },
        ],
      },
      org.id, customers, categories, [anaMartinez, carlosLopez], tagMap,
    );

    // Ticket 4: Resolved, low
    await createTicket(
      this.ticketRepo, this.messageRepo, this.ticketTagRepo, this.auditRepo,
      {
        title: 'Solicitud de nueva funcionalidad: exportar a PDF',
        description: 'Sería muy útil poder exportar los reportes directamente a PDF desde el panel.',
        status: 'resolved',
        priority: 'low',
        customerIdx: 3,
        categoryIdx: 3,
        assignedToIdx: 1,
        daysAgo: 7,
        tags: ['mejora', 'documentación'],
        messages: [
          { content: '¿Podrían agregar la opción de exportar a PDF?', authorType: 'customer', userId: null, daysAgo: 7 },
          { content: 'Gracias por la sugerencia, Laura. Lo hemos agregado a nuestro roadmap.', authorType: 'agent', userId: 1, daysAgo: 6 },
          { content: 'La funcionalidad ya está disponible en la última versión.', authorType: 'agent', userId: 1, daysAgo: 3 },
        ],
      },
      org.id, customers, categories, [anaMartinez, carlosLopez], tagMap,
    );

    // Ticket 5: Open, medium (another one)
    await createTicket(
      this.ticketRepo, this.messageRepo, this.ticketTagRepo, this.auditRepo,
      {
        title: 'Consulta sobre planes disponibles',
        description: 'Quisiera conocer los detalles de los planes empresariales y si tienen descuento por volumen.',
        status: 'open',
        priority: 'medium',
        customerIdx: 4,
        categoryIdx: 4,
        assignedToIdx: null,
        daysAgo: 1,
        tags: [],
        messages: [
          { content: 'Hola, estoy interesado en contratar el plan empresarial. ¿Me pueden dar más información?', authorType: 'customer', userId: null, daysAgo: 1 },
        ],
      },
      org.id, customers, categories, [anaMartinez, carlosLopez], tagMap,
    );

    // Ticket 6: New, medium
    await createTicket(
      this.ticketRepo, this.messageRepo, this.ticketTagRepo, this.auditRepo,
      {
        title: 'Error al cargar imágenes en el perfil',
        description: 'Cuando intento subir una imagen de perfil, me aparece un error 500.',
        status: 'new',
        priority: 'medium',
        customerIdx: 0,
        categoryIdx: 2,
        assignedToIdx: null,
        daysAgo: 0,
        tags: ['error-conocido'],
        messages: [],
      },
      org.id, customers, categories, [anaMartinez, carlosLopez], tagMap,
    );

    // Ticket 7: Resolved
    await createTicket(
      this.ticketRepo, this.messageRepo, this.ticketTagRepo, this.auditRepo,
      {
        title: 'Problema con el restablecimiento de contraseña',
        description: 'No recibo el correo para restablecer mi contraseña. He intentado varias veces.',
        status: 'resolved',
        priority: 'high',
        customerIdx: 3,
        categoryIdx: 0,
        assignedToIdx: 1,
        daysAgo: 5,
        tags: ['revisión', 'error-conocido'],
        messages: [
          { content: 'No me llega el email de recuperación de contraseña.', authorType: 'customer', userId: null, daysAgo: 5 },
          { content: 'Estamos investigando el problema con el servicio de correo.', authorType: 'agent', userId: 1, daysAgo: 4 },
          { content: 'El problema estaba en el servidor SMTP. Ya está resuelto. Por favor, intenta de nuevo.', authorType: 'agent', userId: 1, daysAgo: 3 },
          { content: 'Ya pude restablecer mi contraseña. ¡Gracias!', authorType: 'customer', userId: null, daysAgo: 2 },
        ],
      },
      org.id, customers, categories, [anaMartinez, carlosLopez], tagMap,
    );

    // Ticket 8: In progress, urgent, assigned to Ana
    await createTicket(
      this.ticketRepo, this.messageRepo, this.ticketTagRepo, this.auditRepo,
      {
        title: 'Caída del servicio de pagos',
        description: 'El módulo de pagos está caído. Los usuarios no pueden completar transacciones. Es crítico.',
        status: 'in_progress',
        priority: 'urgent',
        customerIdx: 4,
        categoryIdx: 1,
        assignedToIdx: 0,
        daysAgo: 0,
        tags: ['urgente', 'prioritario'],
        messages: [
          { content: '¡El sistema de pagos no funciona! Necesitamos una solución inmediata.', authorType: 'customer', userId: null, daysAgo: 0 },
          { content: 'Estamos trabajando en ello. Hemos detectado una falla en la pasarela de pagos.', authorType: 'agent', userId: 0, daysAgo: 0 },
        ],
      },
      org.id, customers, categories, [anaMartinez, carlosLopez], tagMap,
    );

    this.logger.log('Database seeded successfully');
  }
}
