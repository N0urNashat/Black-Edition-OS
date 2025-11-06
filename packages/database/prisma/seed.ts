import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate dates in the past 3 months
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
const today = new Date();

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n');

  // ====================
  // 1. ORGANIZATIONS (2 orgs)
  // ====================
  console.log('📦 Creating organizations...');

  const blackEdition = await prisma.organization.upsert({
    where: { slug: 'black-edition' },
    update: {},
    create: {
      clerkId: 'org_black_edition',
      name: 'Black Edition Agency',
      slug: 'black-edition',
      email: 'info@blackedition.eg',
      phone: '+20 2 1234 5678',
      website: 'https://blackedition.eg',
      address: {
        street: '123 Tahrir Street',
        city: 'Cairo',
        state: 'Cairo Governorate',
        zip: '11511',
        country: 'Egypt',
      },
      settings: {
        timezone: 'Africa/Cairo',
        currency: 'EGP',
        language: 'ar',
        branding: { primaryColor: '#93DA97', logo: '/logo.png' },
      },
    },
  });

  const digitalHub = await prisma.organization.upsert({
    where: { slug: 'digital-hub' },
    update: {},
    create: {
      clerkId: 'org_digital_hub',
      name: 'Digital Hub Egypt',
      slug: 'digital-hub',
      email: 'contact@digitalhub.eg',
      phone: '+20 3 987 6543',
      website: 'https://digitalhub.eg',
      address: {
        street: '45 Corniche Road',
        city: 'Alexandria',
        state: 'Alexandria Governorate',
        zip: '21500',
        country: 'Egypt',
      },
      settings: {
        timezone: 'Africa/Cairo',
        currency: 'EGP',
        language: 'ar',
      },
    },
  });

  console.log(`✅ Created ${blackEdition.name}`);
  console.log(`✅ Created ${digitalHub.name}\n`);

  // ====================
  // 2. USERS (6 users)
  // ====================
  console.log('👥 Creating users...');

  const users = await Promise.all([
    // Black Edition users
    prisma.user.upsert({
      where: { email: 'mohamed.hassan@blackedition.eg' },
      update: {},
      create: {
        clerkId: 'user_mohamed_hassan',
        email: 'mohamed.hassan@blackedition.eg',
        name: 'Mohamed Hassan',
        phone: '+20 100 123 4567',
        title: 'CEO & Founder',
        role: 'ADMIN',
        organizationId: blackEdition.id,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'fatma.ali@blackedition.eg' },
      update: {},
      create: {
        clerkId: 'user_fatma_ali',
        email: 'fatma.ali@blackedition.eg',
        name: 'Fatma Ali',
        phone: '+20 101 234 5678',
        title: 'Project Manager',
        role: 'MANAGER',
        organizationId: blackEdition.id,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'ahmed.salem@blackedition.eg' },
      update: {},
      create: {
        clerkId: 'user_ahmed_salem',
        email: 'ahmed.salem@blackedition.eg',
        name: 'Ahmed Salem',
        phone: '+20 102 345 6789',
        title: 'Senior Developer',
        role: 'MEMBER',
        organizationId: blackEdition.id,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'sara.ibrahim@blackedition.eg' },
      update: {},
      create: {
        clerkId: 'user_sara_ibrahim',
        email: 'sara.ibrahim@blackedition.eg',
        name: 'Sara Ibrahim',
        phone: '+20 103 456 7890',
        title: 'Sales Manager',
        role: 'MANAGER',
        organizationId: blackEdition.id,
        isActive: true,
      },
    }),
    // Digital Hub users
    prisma.user.upsert({
      where: { email: 'khaled.omar@digitalhub.eg' },
      update: {},
      create: {
        clerkId: 'user_khaled_omar',
        email: 'khaled.omar@digitalhub.eg',
        name: 'Khaled Omar',
        phone: '+20 104 567 8901',
        title: 'Managing Director',
        role: 'ADMIN',
        organizationId: digitalHub.id,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'nour.mahmoud@digitalhub.eg' },
      update: {},
      create: {
        clerkId: 'user_nour_mahmoud',
        email: 'nour.mahmoud@digitalhub.eg',
        name: 'Nour Mahmoud',
        phone: '+20 105 678 9012',
        title: 'Account Manager',
        role: 'MANAGER',
        organizationId: digitalHub.id,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users\n`);

  const [mohamed, fatma, ahmed, sara, khaled, nour] = users;

  // ====================
  // 3. LEADS (18 leads - Black Edition only)
  // ====================
  console.log('🎯 Creating leads...');

  const leadData = [
    { name: 'Hassan Abdel Aziz', company: 'Egypt Tech Solutions', email: 'hassan@egypttech.com', status: 'NEW', score: 45, budget: 35000, timeline: 'soon', source: 'website', decisionMaker: true },
    { name: 'Mariam Mostafa', company: 'Cairo Digital Marketing', email: 'mariam@cairodigital.com', status: 'CONTACTED', score: 65, budget: 50000, timeline: 'urgent', source: 'referral', decisionMaker: true },
    { name: 'Youssef Kamel', company: 'Giza Industries Ltd', email: 'youssef@gizaindustries.com', status: 'QUALIFIED', score: 80, budget: 75000, timeline: 'urgent', source: 'cold-outreach', decisionMaker: true },
    { name: 'Laila Fathy', company: 'Alexandria Retail', email: 'laila@alexretail.com', status: 'PROPOSAL', score: 85, budget: 60000, timeline: 'soon', source: 'referral', decisionMaker: true },
    { name: 'Omar Sherif', company: 'Delta Foods', email: 'omar@deltafoods.eg', status: 'NEGOTIATION', score: 90, budget: 85000, timeline: 'urgent', source: 'referral', decisionMaker: true },
    { name: 'Heba Nasser', company: 'Smart Education Hub', email: 'heba@smartedu.eg', status: 'WON', score: 95, budget: 55000, timeline: 'urgent', source: 'website', decisionMaker: true },
    { name: 'Karim Essam', company: 'Cairo Fashion House', email: 'karim@cairofashion.com', status: 'WON', score: 88, budget: 45000, timeline: 'soon', source: 'social', decisionMaker: true },
    { name: 'Mona Zaki', company: 'Nile Pharmaceuticals', email: 'mona@nilepharma.eg', status: 'LOST', score: 70, budget: 90000, timeline: 'future', source: 'cold-outreach', decisionMaker: false },
    { name: 'Tarek Gamal', company: 'Giza Real Estate', email: 'tarek@gizarealestate.com', status: 'NEW', score: 40, budget: 40000, timeline: 'future', source: 'website', decisionMaker: false },
    { name: 'Dina Ahmed', company: 'Cairo Fitness Center', email: 'dina@cairofitness.eg', status: 'CONTACTED', score: 55, budget: 25000, timeline: 'soon', source: 'social', decisionMaker: true },
    { name: 'Mahmoud Farouk', company: 'Alexandria Tourism', email: 'mahmoud@alextourism.com', status: 'QUALIFIED', score: 75, budget: 65000, timeline: 'urgent', source: 'referral', decisionMaker: true },
    { name: 'Noha Salah', company: 'Cairo Auto Parts', email: 'noha@cairoauto.com', status: 'NEW', score: 35, budget: 30000, timeline: 'future', source: 'cold-outreach', decisionMaker: false },
    { name: 'Amr Khaled', company: 'Delta Logistics', email: 'amr@deltalogistics.eg', status: 'CONTACTED', score: 60, budget: 55000, timeline: 'soon', source: 'website', decisionMaker: true },
    { name: 'Rana Sami', company: 'Giza Construction', email: 'rana@gizaconstruction.com', status: 'PROPOSAL', score: 82, budget: 70000, timeline: 'urgent', source: 'referral', decisionMaker: true },
    { name: 'Sherif Magdy', company: 'Cairo Coffee Shops', email: 'sherif@cairocoffee.eg', status: 'NEW', score: 50, budget: 28000, timeline: 'future', source: 'social', decisionMaker: false },
    { name: 'Yasmin Fouad', company: 'Alexandria Healthcare', email: 'yasmin@alexhealth.com', status: 'QUALIFIED', score: 78, budget: 62000, timeline: 'soon', source: 'referral', decisionMaker: true },
    { name: 'Walid Hosny', company: 'Cairo Electronics', email: 'walid@cairoelectronics.com', status: 'CONTACTED', score: 58, budget: 42000, timeline: 'soon', source: 'website', decisionMaker: true },
    { name: 'Salma Adel', company: 'Giza Legal Services', email: 'salma@gizalegal.com', status: 'NEW', score: 48, budget: 38000, timeline: 'future', source: 'cold-outreach', decisionMaker: false },
  ];

  const leads = await Promise.all(
    leadData.map((lead) =>
      prisma.lead.create({
        data: {
          ...lead,
          organizationId: blackEdition.id,
          createdById: sara.id,
          assignedToId: Math.random() > 0.5 ? sara.id : mohamed.id,
          createdAt: randomDate(threeMonthsAgo, today),
          requirements: `Looking for complete digital transformation including website redesign, mobile app, and social media management.`,
          notes: `Initial contact made via ${lead.source}. Client is ${lead.decisionMaker ? 'the' : 'not the'} decision maker.`,
        },
      })
    )
  );

  console.log(`✅ Created ${leads.length} leads\n`);

  // ====================
  // 4. CUSTOMERS (7 customers - converted from won leads)
  // ====================
  console.log('🏢 Creating customers...');

  const wonLeads = leads.filter(l => leadData.find(ld => ld.name === l.name)?.status === 'WON');

  const customerData = [
    { name: 'Tech Valley Egypt', company: 'Tech Valley Egypt', email: 'info@techvalley.eg', phone: '+20 2 3456 7890', servicePackage: 'PREMIUM', contractStart: new Date('2024-10-01'), monthlyValue: 68000 },
    { name: 'Cairo E-Commerce Hub', company: 'Cairo E-Commerce Hub', email: 'contact@cairoecom.eg', phone: '+20 2 2345 6789', servicePackage: 'GROWTH', contractStart: new Date('2024-09-15'), monthlyValue: 52000 },
    { name: 'Smart Education Hub', company: 'Smart Education Hub', email: 'heba@smartedu.eg', phone: '+20 2 1234 5678', servicePackage: 'PREMIUM', contractStart: new Date('2024-11-01'), monthlyValue: 55000 },
    { name: 'Cairo Fashion House', company: 'Cairo Fashion House', email: 'karim@cairofashion.com', phone: '+20 2 9876 5432', servicePackage: 'GROWTH', contractStart: new Date('2024-10-20'), monthlyValue: 45000 },
    { name: 'Giza Medical Center', company: 'Giza Medical Center', email: 'info@gizamedical.eg', phone: '+20 2 8765 4321', servicePackage: 'ENTERPRISE', contractStart: new Date('2024-08-01'), monthlyValue: 95000 },
    { name: 'Alexandria Exports', company: 'Alexandria Exports', email: 'sales@alexexports.com', phone: '+20 3 7654 3210', servicePackage: 'STARTER', contractStart: new Date('2024-10-10'), monthlyValue: 28000 },
    { name: 'Nile Transport Co', company: 'Nile Transport Co', email: 'info@niletransport.eg', phone: '+20 2 6543 2109', servicePackage: 'GROWTH', contractStart: new Date('2024-09-01'), monthlyValue: 48000 },
  ];

  const customers = await Promise.all(
    customerData.map((customer, i) => {
      const contractEnd = new Date(customer.contractStart);
      contractEnd.setFullYear(contractEnd.getFullYear() + 1);

      return prisma.customer.create({
        data: {
          name: customer.name,
          company: customer.company,
          email: customer.email,
          phone: customer.phone,
          status: 'ACTIVE',
          servicePackage: customer.servicePackage as any,
          contractStart: customer.contractStart,
          contractEnd: contractEnd,
          organizationId: blackEdition.id,
          address: {
            street: `${100 + i * 10} Street`,
            city: i % 3 === 0 ? 'Cairo' : i % 3 === 1 ? 'Giza' : 'Alexandria',
            country: 'Egypt',
          },
          notes: `Monthly retainer: EGP ${customer.monthlyValue.toLocaleString()}. Services include web development, mobile apps, and digital marketing.`,
        },
      });
    })
  );

  // Update won leads with customer references
  for (let i = 0; i < Math.min(wonLeads.length, customers.length); i++) {
    await prisma.lead.update({
      where: { id: wonLeads[i].id },
      data: {
        customerId: customers[i].id,
        convertedAt: randomDate(threeMonthsAgo, today),
      },
    });
  }

  console.log(`✅ Created ${customers.length} customers\n`);

  // ====================
  // 5. PROJECTS (8 projects)
  // ====================
  console.log('📁 Creating projects...');

  const projectData = [
    { name: 'Tech Valley - E-Commerce Platform', customerId: customers[0].id, status: 'IN_PROGRESS', priority: 'HIGH', budget: 150000, estimatedHours: 320, progress: 65, health: 'ON_TRACK' },
    { name: 'Cairo E-Com - Mobile App Development', customerId: customers[1].id, status: 'IN_PROGRESS', priority: 'URGENT', budget: 120000, estimatedHours: 280, progress: 45, health: 'AT_RISK' },
    { name: 'Smart Education - Learning Platform', customerId: customers[2].id, status: 'IN_PROGRESS', priority: 'HIGH', budget: 180000, estimatedHours: 400, progress: 30, health: 'ON_TRACK' },
    { name: 'Cairo Fashion - Website Redesign', customerId: customers[3].id, status: 'COMPLETED', priority: 'MEDIUM', budget: 85000, estimatedHours: 180, progress: 100, health: 'ON_TRACK' },
    { name: 'Giza Medical - Patient Portal', customerId: customers[4].id, status: 'IN_PROGRESS', priority: 'URGENT', budget: 220000, estimatedHours: 480, progress: 55, health: 'DELAYED' },
    { name: 'Alexandria Exports - Inventory System', customerId: customers[5].id, status: 'PLANNING', priority: 'MEDIUM', budget: 95000, estimatedHours: 200, progress: 10, health: 'ON_TRACK' },
    { name: 'Nile Transport - Tracking System', customerId: customers[6].id, status: 'IN_PROGRESS', priority: 'HIGH', budget: 140000, estimatedHours: 300, progress: 40, health: 'ON_TRACK' },
    { name: 'Tech Valley - Mobile App Phase 2', customerId: customers[0].id, status: 'PLANNING', priority: 'MEDIUM', budget: 95000, estimatedHours: 220, progress: 5, health: 'ON_TRACK' },
  ];

  const projects = await Promise.all(
    projectData.map((project) => {
      const startDate = randomDate(threeMonthsAgo, today);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);

      return prisma.project.create({
        data: {
          ...project,
          organizationId: blackEdition.id,
          createdById: fatma.id,
          startDate,
          endDate,
          actualHours: Math.floor(project.estimatedHours * (project.progress / 100)),
          description: `Comprehensive ${project.name} including design, development, testing, and deployment.`,
          tags: ['web', 'mobile', 'backend'],
          createdAt: startDate,
        },
      });
    })
  );

  console.log(`✅ Created ${projects.length} projects\n`);

  // Add project members
  console.log('👥 Adding project members...');
  for (const project of projects) {
    await prisma.projectMember.createMany({
      data: [
        { projectId: project.id, userId: fatma.id, role: 'lead' },
        { projectId: project.id, userId: ahmed.id, role: 'member' },
      ],
    });
  }
  console.log(`✅ Added project members\n`);

  // ====================
  // 6. MILESTONES (12 milestones)
  // ====================
  console.log('🎯 Creating milestones...');

  const milestones = [];
  for (const project of projects.slice(0, 4)) {
    const projectStart = project.startDate || new Date();
    milestones.push(
      await prisma.milestone.create({
        data: {
          projectId: project.id,
          name: 'Design Approval',
          description: 'Complete UI/UX design and get client approval',
          dueDate: new Date(projectStart.getTime() + 14 * 24 * 60 * 60 * 1000),
          completed: project.progress > 30,
          completedAt: project.progress > 30 ? new Date(projectStart.getTime() + 12 * 24 * 60 * 60 * 1000) : null,
        },
      }),
      await prisma.milestone.create({
        data: {
          projectId: project.id,
          name: 'Development Complete',
          description: 'Complete all development work',
          dueDate: new Date(projectStart.getTime() + 60 * 24 * 60 * 60 * 1000),
          completed: project.progress > 80,
          completedAt: project.progress > 80 ? new Date(projectStart.getTime() + 58 * 24 * 60 * 60 * 1000) : null,
        },
      }),
      await prisma.milestone.create({
        data: {
          projectId: project.id,
          name: 'Testing & QA',
          description: 'Complete testing and quality assurance',
          dueDate: new Date(projectStart.getTime() + 75 * 24 * 60 * 60 * 1000),
          completed: project.progress === 100,
          completedAt: project.progress === 100 ? new Date(projectStart.getTime() + 73 * 24 * 60 * 60 * 1000) : null,
        },
      })
    );
  }
  console.log(`✅ Created ${milestones.length} milestones\n`);

  // ====================
  // 7. TASKS (28 tasks)
  // ====================
  console.log('✅ Creating tasks...');

  const taskData = [
    { title: 'Design homepage mockup', status: 'DONE', priority: 'HIGH', estimatedTime: 8, actualTime: 7.5 },
    { title: 'Implement user authentication', status: 'DONE', priority: 'URGENT', estimatedTime: 16, actualTime: 18 },
    { title: 'Build product catalog', status: 'IN_PROGRESS', priority: 'HIGH', estimatedTime: 24, actualTime: 12 },
    { title: 'Set up payment gateway', status: 'IN_PROGRESS', priority: 'URGENT', estimatedTime: 12, actualTime: 8 },
    { title: 'Create admin dashboard', status: 'TODO', priority: 'MEDIUM', estimatedTime: 20, actualTime: 0 },
    { title: 'Write API documentation', status: 'TODO', priority: 'LOW', estimatedTime: 8, actualTime: 0 },
    { title: 'Mobile app wireframes', status: 'DONE', priority: 'HIGH', estimatedTime: 12, actualTime: 11 },
  ];

  const tasks = [];
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const taskCount = i < 3 ? 4 : 3; // More tasks for first 3 projects

    for (let j = 0; j < taskCount; j++) {
      const taskTemplate = taskData[j % taskData.length];
      const task = await prisma.task.create({
        data: {
          projectId: project.id,
          title: `${taskTemplate.title} - ${project.name.split('-')[0].trim()}`,
          description: `Detailed implementation of ${taskTemplate.title.toLowerCase()} for the project.`,
          status: taskTemplate.status as any,
          priority: taskTemplate.priority as any,
          assignedToId: Math.random() > 0.5 ? ahmed.id : fatma.id,
          estimatedTime: taskTemplate.estimatedTime,
          actualTime: taskTemplate.actualTime,
          dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
          position: j,
          tags: ['development', 'design'],
        },
      });
      tasks.push(task);
    }
  }

  console.log(`✅ Created ${tasks.length} tasks\n`);

  // ====================
  // 8. TIME ENTRIES (65 entries)
  // ====================
  console.log('⏱️  Creating time entries...');

  let timeEntryCount = 0;
  for (const task of tasks.filter(t => t.actualTime > 0)) {
    const entries = Math.ceil(task.actualTime / 4); // Split into work sessions

    for (let i = 0; i < entries; i++) {
      const duration = i === entries - 1
        ? task.actualTime - (entries - 1) * 4
        : 4;

      await prisma.timeEntry.create({
        data: {
          userId: task.assignedToId!,
          projectId: task.projectId,
          taskId: task.id,
          description: `Work on: ${task.title}`,
          duration,
          date: randomDate(threeMonthsAgo, today),
          billable: true,
          approved: Math.random() > 0.3,
          approvedAt: Math.random() > 0.3 ? randomDate(threeMonthsAgo, today) : null,
        },
      });
      timeEntryCount++;
    }
  }

  console.log(`✅ Created ${timeEntryCount} time entries\n`);

  // ====================
  // 9. INVOICES (10 invoices)
  // ====================
  console.log('💰 Creating invoices...');

  const invoiceData = [
    { customer: customers[0], project: projects[0], status: 'PAID', amount: 50000, items: [{ desc: 'Website Development - Phase 1', qty: 1, rate: 50000 }] },
    { customer: customers[1], project: projects[1], status: 'PAID', amount: 40000, items: [{ desc: 'Mobile App - Initial Development', qty: 1, rate: 40000 }] },
    { customer: customers[2], project: projects[2], status: 'SENT', amount: 60000, items: [{ desc: 'Learning Platform - Setup & Design', qty: 1, rate: 60000 }] },
    { customer: customers[3], project: projects[3], status: 'PAID', amount: 85000, items: [{ desc: 'Website Redesign - Complete', qty: 1, rate: 85000 }] },
    { customer: customers[4], project: projects[4], status: 'PARTIALLY_PAID', amount: 75000, items: [{ desc: 'Patient Portal - Phase 1', qty: 1, rate: 75000 }] },
    { customer: customers[5], project: projects[5], status: 'DRAFT', amount: 35000, items: [{ desc: 'Inventory System - Planning', qty: 1, rate: 35000 }] },
    { customer: customers[6], project: projects[6], status: 'SENT', amount: 45000, items: [{ desc: 'Tracking System - Development', qty: 1, rate: 45000 }] },
    { customer: customers[0], project: projects[7], status: 'OVERDUE', amount: 30000, items: [{ desc: 'Monthly Retainer - October', qty: 1, rate: 30000 }] },
    { customer: customers[1], project: projects[1], status: 'PAID', amount: 28000, items: [{ desc: 'Monthly Retainer - September', qty: 1, rate: 28000 }] },
    { customer: customers[2], project: projects[2], status: 'VIEWED', amount: 55000, items: [{ desc: 'Learning Platform - Phase 2', qty: 1, rate: 55000 }] },
  ];

  const invoices = [];
  for (let i = 0; i < invoiceData.length; i++) {
    const data = invoiceData[i];
    const issueDate = randomDate(threeMonthsAgo, today);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await prisma.invoice.create({
      data: {
        organizationId: blackEdition.id,
        customerId: data.customer.id,
        projectId: data.project.id,
        invoiceNumber: `INV-2024-${String(i + 1).padStart(3, '0')}`,
        status: data.status as any,
        issueDate,
        dueDate,
        subtotal: data.amount,
        taxRate: 14, // Egypt VAT
        taxAmount: data.amount * 0.14,
        total: data.amount * 1.14,
        paidAmount: data.status === 'PAID' ? data.amount * 1.14 : data.status === 'PARTIALLY_PAID' ? data.amount * 0.5 * 1.14 : 0,
        currency: 'EGP',
        notes: 'Thank you for your business!',
        terms: 'Payment due within 30 days. Late payments subject to 2% monthly interest.',
        sentAt: ['SENT', 'VIEWED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(data.status) ? issueDate : null,
        viewedAt: ['VIEWED', 'PAID', 'PARTIALLY_PAID'].includes(data.status) ? new Date(issueDate.getTime() + 24 * 60 * 60 * 1000) : null,
        paidAt: data.status === 'PAID' ? new Date(issueDate.getTime() + 15 * 24 * 60 * 60 * 1000) : null,
        createdById: fatma.id,
        createdAt: issueDate,
      },
    });

    // Create line items
    for (let j = 0; j < data.items.length; j++) {
      const item = data.items[j];
      await prisma.invoiceLineItem.create({
        data: {
          invoiceId: invoice.id,
          description: item.desc,
          quantity: item.qty,
          rate: item.rate,
          amount: item.qty * item.rate,
          taxable: true,
          position: j,
        },
      });
    }

    invoices.push(invoice);
  }

  console.log(`✅ Created ${invoices.length} invoices\n`);

  // ====================
  // 10. PAYMENTS (8 payments)
  // ====================
  console.log('💳 Creating payments...');

  const paidInvoices = invoices.filter(inv => ['PAID', 'PARTIALLY_PAID'].includes(inv.status));
  const payments = await Promise.all(
    paidInvoices.map((invoice) =>
      prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.paidAmount,
          method: Math.random() > 0.5 ? 'BANK_TRANSFER' : 'PAYMOB',
          status: 'COMPLETED',
          gateway: Math.random() > 0.5 ? 'paymob' : null,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          paidAt: invoice.paidAt,
          notes: 'Payment received successfully.',
        },
      })
    )
  );

  console.log(`✅ Created ${payments.length} payments\n`);

  // ====================
  // 11. FILES (15 files)
  // ====================
  console.log('📎 Creating files...');

  const fileCount = 15;
  for (let i = 0; i < fileCount; i++) {
    const entityType = i % 3;
    await prisma.file.create({
      data: {
        organizationId: blackEdition.id,
        name: `document-${i + 1}.pdf`,
        originalName: `Project Document ${i + 1}.pdf`,
        size: Math.floor(Math.random() * 5000000) + 100000,
        mimeType: 'application/pdf',
        url: `https://storage.blackedition.eg/files/document-${i + 1}.pdf`,
        path: `/files/document-${i + 1}.pdf`,
        uploadedById: mohamed.id,
        leadId: entityType === 0 ? leads[i % leads.length].id : null,
        customerId: entityType === 1 ? customers[i % customers.length].id : null,
        projectId: entityType === 2 ? projects[i % projects.length].id : null,
      },
    });
  }

  console.log(`✅ Created ${fileCount} files\n`);

  // ====================
  // 12. ACTIVITIES (120+ activities)
  // ====================
  console.log('📊 Creating activities...');

  let activityCount = 0;

  // Lead activities
  for (const lead of leads) {
    await prisma.activity.create({
      data: {
        organizationId: blackEdition.id,
        userId: lead.createdById,
        action: 'CREATED',
        entityType: 'lead',
        entityId: lead.id,
        description: `Created new lead: ${lead.name} from ${lead.company}`,
        createdAt: lead.createdAt,
      },
    });
    activityCount++;

    if (lead.status !== 'NEW') {
      await prisma.activity.create({
        data: {
          organizationId: blackEdition.id,
          userId: lead.assignedToId || lead.createdById,
          action: 'STATUS_CHANGED',
          entityType: 'lead',
          entityId: lead.id,
          description: `Updated lead status to ${lead.status}`,
          metadata: { from: 'NEW', to: lead.status },
          createdAt: new Date(lead.createdAt.getTime() + 24 * 60 * 60 * 1000),
        },
      });
      activityCount++;
    }
  }

  // Project activities
  for (const project of projects) {
    await prisma.activity.create({
      data: {
        organizationId: blackEdition.id,
        userId: project.createdById,
        action: 'CREATED',
        entityType: 'project',
        entityId: project.id,
        description: `Created project: ${project.name}`,
        createdAt: project.createdAt,
      },
    });
    activityCount++;
  }

  // Task activities
  for (const task of tasks) {
    await prisma.activity.create({
      data: {
        organizationId: blackEdition.id,
        userId: task.assignedToId || mohamed.id,
        action: 'CREATED',
        entityType: 'task',
        entityId: task.id,
        description: `Created task: ${task.title}`,
        createdAt: task.createdAt,
      },
    });
    activityCount++;

    if (task.status !== 'TODO') {
      await prisma.activity.create({
        data: {
          organizationId: blackEdition.id,
          userId: task.assignedToId || mohamed.id,
          action: 'STATUS_CHANGED',
          entityType: 'task',
          entityId: task.id,
          description: `Updated task status to ${task.status}`,
          metadata: { from: 'TODO', to: task.status },
          createdAt: new Date(task.createdAt.getTime() + 12 * 60 * 60 * 1000),
        },
      });
      activityCount++;
    }
  }

  // Invoice activities
  for (const invoice of invoices) {
    await prisma.activity.create({
      data: {
        organizationId: blackEdition.id,
        userId: invoice.createdById,
        action: 'CREATED',
        entityType: 'invoice',
        entityId: invoice.id,
        description: `Created invoice ${invoice.invoiceNumber}`,
        createdAt: invoice.createdAt,
      },
    });
    activityCount++;
  }

  console.log(`✅ Created ${activityCount} activities\n`);

  // ====================
  // 13. WORKFLOWS (3 workflows)
  // ====================
  console.log('⚙️  Creating workflows...');

  const workflows = await Promise.all([
    prisma.workflow.create({
      data: {
        organizationId: blackEdition.id,
        name: 'Lead Follow-up Automation',
        description: 'Automatically send follow-up email 2 days after lead is created',
        trigger: {
          type: 'lead_created',
          conditions: { status: 'NEW' },
        },
        actions: [
          { type: 'wait', duration: '2 days' },
          { type: 'send_email', template: 'lead_followup' },
          { type: 'update_status', status: 'CONTACTED' },
        ],
        active: true,
        createdById: mohamed.id,
      },
    }),
    prisma.workflow.create({
      data: {
        organizationId: blackEdition.id,
        name: 'Invoice Overdue Reminder',
        description: 'Send reminder when invoice is overdue by 7 days',
        trigger: {
          type: 'invoice_overdue',
          conditions: { daysOverdue: 7 },
        },
        actions: [
          { type: 'send_email', template: 'invoice_reminder' },
          { type: 'create_notification', message: 'Invoice overdue' },
        ],
        active: true,
        createdById: fatma.id,
      },
    }),
    prisma.workflow.create({
      data: {
        organizationId: blackEdition.id,
        name: 'Project Milestone Notification',
        description: 'Notify team when project milestone is completed',
        trigger: {
          type: 'milestone_completed',
        },
        actions: [
          { type: 'send_notification', recipients: 'project_team' },
          { type: 'update_project_health' },
        ],
        active: true,
        createdById: fatma.id,
      },
    }),
  ]);

  console.log(`✅ Created ${workflows.length} workflows\n`);

  // ====================
  // 14. WORKFLOW EXECUTIONS (10 executions)
  // ====================
  console.log('▶️  Creating workflow executions...');

  for (let i = 0; i < 10; i++) {
    await prisma.workflowExecution.create({
      data: {
        workflowId: workflows[i % workflows.length].id,
        status: i % 5 === 0 ? 'FAILED' : 'COMPLETED',
        startedAt: randomDate(threeMonthsAgo, today),
        completedAt: i % 5 === 0 ? null : randomDate(threeMonthsAgo, today),
        error: i % 5 === 0 ? 'Email service unavailable' : null,
        logs: { steps: ['Started', 'Processing', i % 5 === 0 ? 'Failed' : 'Completed'] },
      },
    });
  }

  console.log(`✅ Created 10 workflow executions\n`);

  // ====================
  // 15. REPORTS (5 reports)
  // ====================
  console.log('📈 Creating reports...');

  const reportTypes = ['SALES', 'FINANCIAL', 'PROJECT', 'TIME_TRACKING', 'PERFORMANCE'];
  const reports = await Promise.all(
    reportTypes.map((type, i) => {
      const startDate = new Date(threeMonthsAgo);
      startDate.setDate(1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);

      return prisma.report.create({
        data: {
          organizationId: blackEdition.id,
          name: `${type} Report - ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          type: type as any,
          period: 'monthly',
          startDate,
          endDate,
          data: {
            summary: `Comprehensive ${type.toLowerCase()} analysis`,
            metrics: {
              total: Math.floor(Math.random() * 1000000) + 100000,
              growth: Math.floor(Math.random() * 40) - 10,
              count: Math.floor(Math.random() * 100) + 10,
            },
            charts: ['line', 'bar', 'pie'],
          },
          insights: `Based on AI analysis, ${type.toLowerCase()} performance shows ${Math.random() > 0.5 ? 'positive' : 'steady'} trends with opportunities for improvement in Q4.`,
          generatedById: mohamed.id,
          generatedAt: randomDate(threeMonthsAgo, today),
        },
      });
    })
  );

  console.log(`✅ Created ${reports.length} reports\n`);

  // ====================
  // 16. NOTIFICATIONS (20 notifications)
  // ====================
  console.log('🔔 Creating notifications...');

  const notificationMessages = [
    { title: 'New lead assigned', message: 'You have been assigned a new lead: Tech Valley Egypt', type: 'info' },
    { title: 'Invoice paid', message: 'Invoice INV-2024-001 has been paid - EGP 57,000', type: 'success' },
    { title: 'Task overdue', message: 'Task "Implement user authentication" is overdue', type: 'warning' },
    { title: 'Project milestone completed', message: 'Milestone "Design Approval" completed', type: 'success' },
    { title: 'New comment', message: 'Ahmed commented on your task', type: 'info' },
  ];

  for (let i = 0; i < 20; i++) {
    const notif = notificationMessages[i % notificationMessages.length];
    const isRead = Math.random() > 0.4;
    const createdAt = randomDate(threeMonthsAgo, today);

    await prisma.notification.create({
      data: {
        userId: [mohamed.id, fatma.id, ahmed.id][i % 3],
        title: notif.title,
        message: notif.message,
        type: notif.type,
        read: isRead,
        readAt: isRead ? new Date(createdAt.getTime() + 3600000) : null,
        createdAt,
      },
    });
  }

  console.log(`✅ Created 20 notifications\n`);

  // ====================
  // SUMMARY
  // ====================
  console.log('═══════════════════════════════════════');
  console.log('🎉 DATABASE SEED COMPLETED SUCCESSFULLY!\n');
  console.log('📊 Summary:');
  console.log(`   • Organizations: 2 (Black Edition, Digital Hub)`);
  console.log(`   • Users: ${users.length}`);
  console.log(`   • Leads: ${leads.length}`);
  console.log(`   • Customers: ${customers.length}`);
  console.log(`   • Projects: ${projects.length}`);
  console.log(`   • Milestones: ${milestones.length}`);
  console.log(`   • Tasks: ${tasks.length}`);
  console.log(`   • Time Entries: ${timeEntryCount}`);
  console.log(`   • Invoices: ${invoices.length}`);
  console.log(`   • Payments: ${payments.length}`);
  console.log(`   • Files: ${fileCount}`);
  console.log(`   • Activities: ${activityCount}`);
  console.log(`   • Workflows: ${workflows.length}`);
  console.log(`   • Reports: ${reports.length}`);
  console.log(`   • Notifications: 20`);
  console.log('\n💡 All data includes:');
  console.log('   ✓ Egyptian company names and locations');
  console.log('   ✓ Realistic EGP amounts (25k - 95k monthly)');
  console.log('   ✓ Dates spread over last 3 months');
  console.log('   ✓ Connected relationships (lead → customer → project → tasks)');
  console.log('   ✓ Various statuses and workflows');
  console.log('\n🚀 Ready to run: npx prisma db seed');
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
