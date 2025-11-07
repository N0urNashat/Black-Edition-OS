import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/ai/generate-proposal
 * Generate a project proposal for a lead using AI
 */
export async function generateProposal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({
        status: 'error',
        message: 'leadId is required',
      });
    }

    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Fetch the lead data
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, organizationId },
    });

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found',
      });
    }

    // Construct the prompt for Claude API
    const prompt = `Write a professional project proposal for a new website for ${lead.company || lead.name}.

Client Details:
- Company: ${lead.company || 'N/A'}
- Contact: ${lead.name}
- Email: ${lead.email}
- Phone: ${lead.phone || 'N/A'}
- Requirements: ${lead.requirements || 'Not specified'}
- Budget: ${lead.budget || 'Not specified'}
- Timeline: ${lead.timeline || 'Flexible'}

Please create a comprehensive proposal including:
1. Executive Summary
2. Scope of Work
3. Deliverables
4. Timeline
5. Investment & Payment Terms
6. Next Steps

Keep the tone professional yet approachable.`;

    // Call Anthropic Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const proposal = response.content[0].type === 'text' ? response.content[0].text : '';

    // Log activity
    await prisma.activity.create({
      data: {
        organizationId,
        userId: req.headers['x-user-id'] as string || 'user_1',
        action: 'CREATED',
        entityType: 'lead',
        entityId: leadId,
        description: `AI-generated proposal for lead: ${lead.name}`,
      },
    });

    res.json({
      status: 'success',
      data: {
        proposal,
        leadId,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/generate-report-insights
 * Generate AI-powered insights from aggregated data
 */
export async function generateReportInsights(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Fetch lead stats
    const [totalLeads, leadsByStatus] = await Promise.all([
      prisma.lead.count({ where: { organizationId } }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
    ]);

    const leadStatusCounts: Record<string, number> = {};
    leadsByStatus.forEach((item: any) => {
      leadStatusCounts[item.status] = item._count;
    });

    const leadStats = {
      total: totalLeads,
      new: leadStatusCounts['NEW'] || 0,
      qualified: leadStatusCounts['QUALIFIED'] || 0,
      contacted: leadStatusCounts['CONTACTED'] || 0,
      converted: leadStatusCounts['WON'] || 0,
    };

    // Fetch project stats
    const [totalProjects, projectsByStatus] = await Promise.all([
      prisma.project.count({ where: { organizationId } }),
      prisma.project.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
    ]);

    const projectStatusCounts: Record<string, number> = {};
    projectsByStatus.forEach((item: any) => {
      projectStatusCounts[item.status] = item._count;
    });

    const projectStats = {
      total: totalProjects,
      active: projectStatusCounts['ACTIVE'] || 0,
      completed: projectStatusCounts['COMPLETED'] || 0,
      onHold: projectStatusCounts['ON_HOLD'] || 0,
    };

    // Get invoice stats
    const [invoiceCount, paidRevenue, outstandingRevenue] = await Promise.all([
      prisma.invoice.count({ where: { organizationId } }),
      prisma.invoice.aggregate({
        where: { organizationId, status: 'PAID' },
        _sum: { paidAmount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: { notIn: ['PAID', 'CANCELLED'] },
        },
        _sum: { total: true, paidAmount: true },
      }),
    ]);

    const totalRevenue = paidRevenue._sum.paidAmount || 0;
    const outstanding = (outstandingRevenue._sum.total || 0) - (outstandingRevenue._sum.paidAmount || 0);

    // Construct the prompt for Claude API
    const prompt = `Analyze these business metrics and provide key insights:

Lead Statistics:
- Total Leads: ${leadStats.total}
- New Leads: ${leadStats.new}
- Qualified Leads: ${leadStats.qualified}
- Contacted Leads: ${leadStats.contacted}
- Converted Leads: ${leadStats.converted}

Project Statistics:
- Total Projects: ${projectStats.total}
- Active Projects: ${projectStats.active}
- Completed Projects: ${projectStats.completed}
- On-Hold Projects: ${projectStats.onHold}

Financial Statistics:
- Total Revenue: $${totalRevenue}
- Outstanding Revenue: $${outstanding}
- Total Invoices: ${invoiceCount}

What are the key insights, trends, and recommendations?`;

    // Call Anthropic Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const insights = response.content[0].type === 'text' ? response.content[0].text : '';

    res.json({
      status: 'success',
      data: {
        insights,
        stats: {
          leads: leadStats,
          projects: projectStats,
          revenue: {
            total: totalRevenue,
            outstanding: outstanding,
            invoiceCount: invoiceCount,
          },
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/search
 * Natural language search across entities
 */
export async function aiSearch(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'query is required',
      });
    }

    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // TODO: In production, use Claude API to parse the natural language query
    // For now, implement simple keyword matching

    const queryLower = query.toLowerCase();
    let results: any = {
      leads: [],
      customers: [],
      projects: [],
      invoices: [],
    };

    // Search leads
    if (queryLower.includes('lead') || queryLower.includes('qualified') || queryLower.includes('new')) {
      const where: any = { organizationId };

      if (queryLower.includes('qualified')) {
        where.status = 'QUALIFIED';
      } else if (queryLower.includes('new')) {
        where.status = 'NEW';
      }

      results.leads = await prisma.lead.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });
    }

    // Search customers
    if (queryLower.includes('customer') || queryLower.includes('client')) {
      results.customers = await prisma.customer.findMany({
        where: { organizationId },
        include: {
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });
    }

    // Search projects
    if (queryLower.includes('project') || queryLower.includes('active')) {
      const where: any = { organizationId };

      if (queryLower.includes('active')) {
        where.status = 'ACTIVE';
      }

      results.projects = await prisma.project.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, company: true } },
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });
    }

    // Search invoices
    if (queryLower.includes('invoice') || queryLower.includes('unpaid') || queryLower.includes('overdue')) {
      const where: any = { organizationId };

      if (queryLower.includes('unpaid') || queryLower.includes('overdue')) {
        where.status = { notIn: ['PAID', 'CANCELLED'] };
      }

      results.invoices = await prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, company: true } },
          project: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });
    }

    res.json({
      status: 'success',
      data: {
        query,
        results,
        interpretation: `Found ${results.leads.length} leads, ${results.customers.length} customers, ${results.projects.length} projects, and ${results.invoices.length} invoices matching your query.`,
      },
    });
  } catch (error) {
    next(error);
  }
}
