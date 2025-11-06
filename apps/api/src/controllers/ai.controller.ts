import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';

/**
 * POST /api/ai/generate-proposal
 * Generate a project proposal for a lead using AI
 */
export async function generateProposal(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
    const lead = await db.findLeadById(leadId, organizationId);

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
- Timeline: ${lead.expectedTimeline || 'Flexible'}

Please create a comprehensive proposal including:
1. Executive Summary
2. Scope of Work
3. Deliverables
4. Timeline
5. Investment & Payment Terms
6. Next Steps

Keep the tone professional yet approachable.`;

    // TODO: In production, replace with actual Claude API call
    // For now, return a mock response
    const mockProposal = `# Project Proposal for ${lead.company || lead.name}

## Executive Summary
We are pleased to present this proposal for developing a modern, professional website for ${lead.company || lead.name}. Our team at Black Edition Agency specializes in creating high-performance web solutions that drive business growth and enhance digital presence.

## Scope of Work
Based on our initial discussions, we understand your requirements include:
${lead.requirements || 'A modern, responsive website with user-friendly design and functionality'}

We will deliver a fully functional website with:
- Responsive design optimized for all devices
- Modern, intuitive user interface
- Performance optimization
- SEO-friendly architecture
- Content management capabilities
- Security best practices

## Deliverables
1. Custom website design (3 initial concepts)
2. Fully responsive development
3. Content Management System integration
4. On-page SEO optimization
5. Performance optimization
6. 30 days of post-launch support
7. Training documentation

## Timeline
We propose a ${lead.expectedTimeline || '8-12 week'} development timeline:
- Week 1-2: Discovery & Design
- Week 3-4: Design Refinement & Approval
- Week 5-8: Development & Testing
- Week 9-10: Content Integration
- Week 11-12: Final Testing & Launch

## Investment & Payment Terms
Total Investment: ${lead.budget || 'To be discussed'}

Payment Structure:
- 30% upon contract signing
- 40% upon design approval
- 30% upon project completion

## Next Steps
1. Review and approve this proposal
2. Schedule kickoff meeting
3. Sign service agreement
4. Begin discovery phase

We look forward to partnering with you on this exciting project!

Best regards,
Black Edition Agency Team`;

    // Log activity
    await db.createActivity({
      organizationId,
      userId: req.headers['x-user-id'] as string || 'user_1',
      action: 'CREATED',
      entityType: 'lead',
      entityId: leadId,
      description: `AI-generated proposal for lead: ${lead.name}`,
    });

    res.json({
      status: 'success',
      data: {
        proposal: mockProposal,
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

    // Fetch aggregated stats
    const leadStats = await db.getLeadStats(organizationId);
    const projectStats = await db.getProjectStats(organizationId);

    // Get invoice stats (calculate from invoices)
    const invoices = await db.findManyInvoices({ organizationId });
    const totalRevenue = invoices
      .filter((inv: any) => inv.status === 'PAID')
      .reduce((sum: number, inv: any) => sum + inv.paidAmount, 0);
    const outstandingRevenue = invoices
      .filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
      .reduce((sum: number, inv: any) => sum + (inv.total - inv.paidAmount), 0);

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
- Outstanding Revenue: $${outstandingRevenue}
- Total Invoices: ${invoices.length}

What are the key insights, trends, and recommendations?`;

    // TODO: In production, replace with actual Claude API call
    // For now, return mock insights
    const mockInsights = `## Key Insights & Recommendations

### Lead Conversion Performance
${leadStats.converted > 0
  ? `Your conversion rate is ${((leadStats.converted / leadStats.total) * 100).toFixed(1)}%. ${
      leadStats.converted / leadStats.total > 0.2
        ? "This is excellent - you're converting leads effectively!"
        : "There's room for improvement in lead nurturing and follow-up processes."
    }`
  : "Focus on converting your qualified leads into projects."}

### Project Pipeline
${projectStats.active > 0
  ? `You have ${projectStats.active} active projects. ${
      projectStats.active > 5
        ? "Monitor capacity to ensure quality delivery."
        : "Consider business development to fill the pipeline."
    }`
  : "No active projects - prioritize converting qualified leads."}

### Financial Health
${totalRevenue > 0
  ? `Total revenue of $${totalRevenue} is ${outstandingRevenue > 0 ? `healthy, but you have $${outstandingRevenue} in outstanding invoices.` : "strong with all invoices paid."}`
  : "Focus on closing deals and invoicing completed work."}

${outstandingRevenue > totalRevenue * 0.3
  ? "\n⚠️ **Action Required**: Outstanding invoices exceed 30% of total revenue. Follow up on overdue payments."
  : ""}

### Recommendations
1. ${leadStats.new > leadStats.contacted ? "Prioritize contacting new leads within 24 hours" : "Continue your strong lead follow-up process"}
2. ${projectStats.onHold > 0 ? `Review ${projectStats.onHold} on-hold projects for reactivation opportunities` : "Maintain project momentum"}
3. ${outstandingRevenue > 0 ? "Implement automated payment reminders for outstanding invoices" : "Maintain excellent payment collection practices"}

**Overall Score**: ${leadStats.converted > 3 && projectStats.active > 0 ? "Strong" : leadStats.converted > 0 ? "Growing" : "Building"} - Keep monitoring these metrics weekly.`;

    res.json({
      status: 'success',
      data: {
        insights: mockInsights,
        stats: {
          leads: leadStats,
          projects: projectStats,
          revenue: {
            total: totalRevenue,
            outstanding: outstandingRevenue,
            invoiceCount: invoices.length,
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
) {
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
      const allLeads = await db.findManyLeads({ organizationId });

      if (queryLower.includes('qualified')) {
        results.leads = allLeads.filter((l: any) => l.status === 'QUALIFIED');
      } else if (queryLower.includes('new')) {
        results.leads = allLeads.filter((l: any) => l.status === 'NEW');
      } else {
        results.leads = allLeads;
      }
    }

    // Search customers
    if (queryLower.includes('customer') || queryLower.includes('client')) {
      results.customers = await db.findManyCustomers({ organizationId });
    }

    // Search projects
    if (queryLower.includes('project') || queryLower.includes('active')) {
      const allProjects = await db.findManyProjects({ organizationId });

      if (queryLower.includes('active')) {
        results.projects = allProjects.filter((p: any) => p.status === 'ACTIVE');
      } else {
        results.projects = allProjects;
      }
    }

    // Search invoices
    if (queryLower.includes('invoice') || queryLower.includes('unpaid') || queryLower.includes('overdue')) {
      const allInvoices = await db.findManyInvoices({ organizationId });

      if (queryLower.includes('unpaid') || queryLower.includes('overdue')) {
        results.invoices = allInvoices.filter((i: any) =>
          i.status !== 'PAID' && i.status !== 'CANCELLED'
        );
      } else {
        results.invoices = allInvoices;
      }
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
