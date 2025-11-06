// In-memory data store for development (replaces Prisma when database is not available)
// This stores all data in memory and resets when the server restarts

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  phone: string | null;
  title: string | null;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Lead {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  status: string;
  score: number;
  source: string | null;
  budget: number | null;
  timeline: string | null;
  decisionMaker: boolean;
  requirements: string | null;
  notes: string | null;
  customFields: any;
  createdById: string;
  assignedToId: string | null;
  convertedAt: Date | null;
  customerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Activity {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata: any;
  createdAt: Date;
}

interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  customFields: any;
  createdById: string;
  assignedToId: string | null;
  leadId: string | null; // Reference to original lead
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  organizationId: string;
  customerId: string;
  name: string;
  description: string | null;
  status: string; // PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
  priority: string; // LOW, MEDIUM, HIGH, URGENT
  startDate: Date | null;
  endDate: Date | null;
  budget: number | null;
  estimatedHours: number | null;
  actualHours: number;
  progress: number; // 0-100
  health: string; // ON_TRACK, AT_RISK, DELAYED, CRITICAL
  tags: string[];
  customFields: any;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  dueDate: Date;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  id: string;
  projectId: string;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  status: string; // TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE, CANCELLED
  priority: string; // LOW, MEDIUM, HIGH, URGENT
  assignedToId: string | null;
  dueDate: Date | null;
  startDate: Date | null;
  estimatedTime: number | null; // hours
  actualTime: number;
  tags: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

class InMemoryDataStore {
  private users: Map<string, User> = new Map();
  private leads: Map<string, Lead> = new Map();
  private activities: Map<string, Activity> = new Map();
  private customers: Map<string, Customer> = new Map();
  private projects: Map<string, Project> = new Map();
  private milestones: Map<string, Milestone> = new Map();
  private tasks: Map<string, Task> = new Map();

  constructor() {
    this.seedData();
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private seedData() {
    // Create organizations and users
    const org1 = 'org_black_edition';

    // Create users
    const users = [
      {
        id: 'user_1',
        clerkId: 'clerk_mohamed',
        email: 'mohamed.hassan@blackedition.eg',
        name: 'Mohamed Hassan',
        avatar: null,
        role: 'ADMIN',
        phone: '+20 100 123 4567',
        title: 'CEO & Founder',
        organizationId: org1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user_2',
        clerkId: 'clerk_sara',
        email: 'sara.ibrahim@blackedition.eg',
        name: 'Sara Ibrahim',
        avatar: null,
        role: 'MANAGER',
        phone: '+20 103 456 7890',
        title: 'Sales Manager',
        organizationId: org1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    users.forEach(user => this.users.set(user.id, user));

    // Create leads
    const leads = [
      {
        id: 'lead_1',
        organizationId: org1,
        name: 'Hassan Abdel Aziz',
        company: 'Egypt Tech Solutions',
        email: 'hassan@egypttech.com',
        phone: '+20 100 555 1234',
        website: 'https://egypttech.com',
        status: 'NEW',
        score: 45,
        source: 'website',
        budget: 35000,
        timeline: 'soon',
        decisionMaker: true,
        requirements: 'Looking for complete digital transformation including website redesign, mobile app, and social media management.',
        notes: 'Initial contact made via website. Client is the decision maker.',
        customFields: null,
        createdById: 'user_2',
        assignedToId: 'user_2',
        convertedAt: null,
        customerId: null,
        createdAt: new Date('2024-11-03'),
        updatedAt: new Date('2024-11-03'),
      },
      {
        id: 'lead_2',
        organizationId: org1,
        name: 'Mariam Mostafa',
        company: 'Cairo Digital Marketing',
        email: 'mariam@cairodigital.com',
        phone: '+20 101 555 5678',
        website: 'https://cairodigital.com',
        status: 'CONTACTED',
        score: 65,
        source: 'referral',
        budget: 50000,
        timeline: 'urgent',
        decisionMaker: true,
        requirements: 'Need comprehensive digital marketing strategy and execution.',
        notes: 'Referred by existing client.',
        customFields: null,
        createdById: 'user_2',
        assignedToId: 'user_1',
        convertedAt: null,
        customerId: null,
        createdAt: new Date('2024-10-28'),
        updatedAt: new Date('2024-10-29'),
      },
      {
        id: 'lead_3',
        organizationId: org1,
        name: 'Youssef Kamel',
        company: 'Giza Industries Ltd',
        email: 'youssef@gizaindustries.com',
        phone: '+20 102 555 9012',
        website: 'https://gizaindustries.com',
        status: 'QUALIFIED',
        score: 80,
        source: 'cold-outreach',
        budget: 75000,
        timeline: 'urgent',
        decisionMaker: true,
        requirements: 'Enterprise website and mobile app development.',
        notes: 'Very interested, budget confirmed.',
        customFields: null,
        createdById: 'user_2',
        assignedToId: 'user_2',
        convertedAt: null,
        customerId: null,
        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-10-20'),
      },
    ];

    leads.forEach(lead => this.leads.set(lead.id, lead));

    // Create activities
    leads.forEach(lead => {
      const activity: Activity = {
        id: this.generateId(),
        organizationId: org1,
        userId: lead.createdById,
        action: 'CREATED',
        entityType: 'lead',
        entityId: lead.id,
        description: `Created new lead: ${lead.name} from ${lead.company}`,
        metadata: null,
        createdAt: lead.createdAt,
      };
      this.activities.set(activity.id, activity);
    });
  }

  // Lead methods
  async findManyLeads(filter: any = {}) {
    let filtered = Array.from(this.leads.values());

    if (filter.organizationId) {
      filtered = filtered.filter(l => l.organizationId === filter.organizationId);
    }

    if (filter.status) {
      filtered = filtered.filter(l => l.status === filter.status);
    }

    if (filter.assignedToId) {
      filtered = filtered.filter(l => l.assignedToId === filter.assignedToId);
    }

    if (filter.score?.gte !== undefined) {
      filtered = filtered.filter(l => l.score >= filter.score.gte);
    }

    if (filter.score?.lte !== undefined) {
      filtered = filtered.filter(l => l.score <= filter.score.lte);
    }

    if (filter.OR) {
      const searchTerms = filter.OR;
      filtered = filtered.filter(l => {
        return searchTerms.some((term: any) => {
          const field = Object.keys(term)[0];
          const value = term[field].contains?.toLowerCase();
          return l[field as keyof Lead]?.toString().toLowerCase().includes(value);
        });
      });
    }

    return filtered.map(lead => ({
      ...lead,
      createdBy: this.users.get(lead.createdById),
      assignedTo: lead.assignedToId ? this.users.get(lead.assignedToId) : null,
      _count: {
        activities: Array.from(this.activities.values()).filter(a => a.entityId === lead.id).length,
        files: 0,
      },
    }));
  }

  async countLeads(filter: any = {}) {
    const leads = await this.findManyLeads(filter);
    return leads.length;
  }

  async findLeadById(id: string, organizationId: string) {
    const lead = this.leads.get(id);
    if (!lead || lead.organizationId !== organizationId) {
      return null;
    }

    const activities = Array.from(this.activities.values())
      .filter(a => a.entityId === id)
      .map(a => ({
        ...a,
        user: this.users.get(a.userId),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      ...lead,
      createdBy: this.users.get(lead.createdById),
      assignedTo: lead.assignedToId ? this.users.get(lead.assignedToId) : null,
      customer: null,
      activities,
      files: [],
    };
  }

  async createLead(data: Partial<Lead>) {
    const id = this.generateId();
    const now = new Date();

    const lead: Lead = {
      id,
      organizationId: data.organizationId!,
      name: data.name!,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      website: data.website || null,
      status: 'NEW',
      score: data.score || 0,
      source: data.source || null,
      budget: data.budget || null,
      timeline: data.timeline || null,
      decisionMaker: data.decisionMaker || false,
      requirements: data.requirements || null,
      notes: data.notes || null,
      customFields: null,
      createdById: data.createdById!,
      assignedToId: data.assignedToId || null,
      convertedAt: null,
      customerId: null,
      createdAt: now,
      updatedAt: now,
    };

    this.leads.set(id, lead);

    return {
      ...lead,
      createdBy: this.users.get(lead.createdById),
      assignedTo: lead.assignedToId ? this.users.get(lead.assignedToId) : null,
    };
  }

  async updateLead(id: string, data: Partial<Lead>) {
    const lead = this.leads.get(id);
    if (!lead) {
      return null;
    }

    const updated = {
      ...lead,
      ...data,
      updatedAt: new Date(),
    };

    this.leads.set(id, updated);

    return {
      ...updated,
      createdBy: this.users.get(updated.createdById),
      assignedTo: updated.assignedToId ? this.users.get(updated.assignedToId) : null,
    };
  }

  async deleteLead(id: string) {
    return this.leads.delete(id);
  }

  // Customer methods
  async createCustomer(data: Partial<Customer>) {
    const id = this.generateId();
    const customer: Customer = {
      id,
      organizationId: data.organizationId!,
      name: data.name!,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      website: data.website || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      notes: data.notes || null,
      customFields: data.customFields || null,
      createdById: data.createdById!,
      assignedToId: data.assignedToId || null,
      leadId: data.leadId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers.set(id, customer);

    return {
      ...customer,
      createdBy: this.users.get(customer.createdById),
      assignedTo: customer.assignedToId ? this.users.get(customer.assignedToId) : null,
    };
  }

  async findManyCustomers(filter: any = {}) {
    let filtered = Array.from(this.customers.values());

    // Filter by organizationId
    if (filter.organizationId) {
      filtered = filtered.filter((c) => c.organizationId === filter.organizationId);
    }

    // Filter by assignedToId
    if (filter.assignedToId) {
      filtered = filtered.filter((c) => c.assignedToId === filter.assignedToId);
    }

    // Search by name, company, or email
    if (filter.OR) {
      filtered = filtered.filter((c) => {
        const searchFields = filter.OR.map((condition: any) => {
          if (condition.name?.contains) {
            return c.name?.toLowerCase().includes(condition.name.contains.toLowerCase());
          }
          if (condition.company?.contains) {
            return c.company?.toLowerCase().includes(condition.company.contains.toLowerCase());
          }
          if (condition.email?.contains) {
            return c.email?.toLowerCase().includes(condition.email.contains.toLowerCase());
          }
          return false;
        });
        return searchFields.some((match) => match);
      });
    }

    return filtered.map((customer) => ({
      ...customer,
      createdBy: this.users.get(customer.createdById),
      assignedTo: customer.assignedToId ? this.users.get(customer.assignedToId) : null,
    }));
  }

  async findCustomerById(id: string, organizationId: string) {
    const customer = this.customers.get(id);
    if (!customer || customer.organizationId !== organizationId) {
      return null;
    }

    return {
      ...customer,
      createdBy: this.users.get(customer.createdById),
      assignedTo: customer.assignedToId ? this.users.get(customer.assignedToId) : null,
    };
  }

  // Project methods
  async createProject(data: Partial<Project>) {
    const id = this.generateId();
    const project: Project = {
      id,
      organizationId: data.organizationId!,
      customerId: data.customerId!,
      name: data.name!,
      description: data.description || null,
      status: data.status || 'PLANNING',
      priority: data.priority || 'MEDIUM',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      budget: data.budget || null,
      estimatedHours: data.estimatedHours || null,
      actualHours: data.actualHours || 0,
      progress: data.progress || 0,
      health: data.health || 'ON_TRACK',
      tags: data.tags || [],
      customFields: data.customFields || null,
      createdById: data.createdById!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects.set(id, project);

    return {
      ...project,
      createdBy: this.users.get(project.createdById),
      customer: this.customers.get(project.customerId),
    };
  }

  async findManyProjects(filter: any = {}) {
    let filtered = Array.from(this.projects.values());

    // Filter by organizationId
    if (filter.organizationId) {
      filtered = filtered.filter((p) => p.organizationId === filter.organizationId);
    }

    // Filter by customerId
    if (filter.customerId) {
      filtered = filtered.filter((p) => p.customerId === filter.customerId);
    }

    // Filter by status
    if (filter.status) {
      filtered = filtered.filter((p) => p.status === filter.status);
    }

    // Search by name or description
    if (filter.OR) {
      filtered = filtered.filter((p) => {
        const searchFields = filter.OR.map((condition: any) => {
          if (condition.name?.contains) {
            return p.name?.toLowerCase().includes(condition.name.contains.toLowerCase());
          }
          if (condition.description?.contains) {
            return p.description?.toLowerCase().includes(condition.description.contains.toLowerCase());
          }
          return false;
        });
        return searchFields.some((match) => match);
      });
    }

    return filtered.map((project) => ({
      ...project,
      createdBy: this.users.get(project.createdById),
      customer: this.customers.get(project.customerId),
    }));
  }

  async findProjectById(id: string, organizationId: string) {
    const project = this.projects.get(id);
    if (!project || project.organizationId !== organizationId) {
      return null;
    }

    return {
      ...project,
      createdBy: this.users.get(project.createdById),
      customer: this.customers.get(project.customerId),
    };
  }

  // ==================== MILESTONE METHODS ====================

  async createMilestone(data: Partial<Milestone>) {
    const id = this.generateId();
    const milestone: Milestone = {
      id,
      projectId: data.projectId!,
      name: data.name!,
      description: data.description || null,
      dueDate: data.dueDate!,
      completed: data.completed || false,
      completedAt: data.completedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.milestones.set(id, milestone);
    return milestone;
  }

  async findManyMilestones(filter: any = {}) {
    let filtered = Array.from(this.milestones.values());

    // Filter by projectId
    if (filter.projectId) {
      filtered = filtered.filter((m) => m.projectId === filter.projectId);
    }

    // Sort by dueDate ascending
    filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return filtered;
  }

  // ==================== TASK METHODS ====================

  async createTask(data: Partial<Task>) {
    const id = this.generateId();
    const task: Task = {
      id,
      projectId: data.projectId!,
      parentTaskId: data.parentTaskId || null,
      title: data.title!,
      description: data.description || null,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      assignedToId: data.assignedToId || null,
      dueDate: data.dueDate || null,
      startDate: data.startDate || null,
      estimatedTime: data.estimatedTime || null,
      actualTime: data.actualTime || 0,
      tags: data.tags || [],
      position: data.position || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(id, task);
    return {
      ...task,
      assignedTo: task.assignedToId ? this.users.get(task.assignedToId) : null,
    };
  }

  async findManyTasks(filter: any = {}) {
    let filtered = Array.from(this.tasks.values());

    // Filter by projectId
    if (filter.projectId) {
      filtered = filtered.filter((t) => t.projectId === filter.projectId);
    }

    // Filter by status
    if (filter.status) {
      filtered = filtered.filter((t) => t.status === filter.status);
    }

    // Filter by assignedToId
    if (filter.assignedToId) {
      filtered = filtered.filter((t) => t.assignedToId === filter.assignedToId);
    }

    // Sort by position
    filtered.sort((a, b) => a.position - b.position);

    return filtered.map((task) => ({
      ...task,
      assignedTo: task.assignedToId ? this.users.get(task.assignedToId) : null,
    }));
  }

  async findTaskById(id: string) {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }

    return {
      ...task,
      assignedTo: task.assignedToId ? this.users.get(task.assignedToId) : null,
    };
  }

  async updateTask(id: string, data: Partial<Task>) {
    const task = this.tasks.get(id);
    if (!task) {
      return null;
    }

    const updatedTask: Task = {
      ...task,
      ...data,
      id: task.id, // Prevent ID change
      projectId: task.projectId, // Prevent projectId change
      createdAt: task.createdAt, // Prevent createdAt change
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    return {
      ...updatedTask,
      assignedTo: updatedTask.assignedToId ? this.users.get(updatedTask.assignedToId) : null,
    };
  }

  async createActivity(data: Partial<Activity>) {
    const id = this.generateId();
    const activity: Activity = {
      id,
      organizationId: data.organizationId!,
      userId: data.userId!,
      action: data.action!,
      entityType: data.entityType!,
      entityId: data.entityId!,
      description: data.description!,
      metadata: data.metadata || null,
      createdAt: new Date(),
    };

    this.activities.set(id, activity);
    return activity;
  }

  async getLeadStats(organizationId: string) {
    const leads = Array.from(this.leads.values()).filter(l => l.organizationId === organizationId);

    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalScore = leads.reduce((sum, lead) => sum + lead.score, 0);
    const avgScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = leads.filter(l => l.createdAt >= startOfMonth).length;

    return {
      total: leads.length,
      thisMonth,
      averageScore: avgScore,
      byStatus: statusCounts,
    };
  }
}

export const db = new InMemoryDataStore();
