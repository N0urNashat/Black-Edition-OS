import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';

/**
 * GET /api/reports
 * Get all reports for an organization
 */
export async function getReports(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { type } = req.query;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    const filter: any = { organizationId };
    if (type) filter.type = type;

    const reports = await db.findManyReports(filter);

    res.json({
      status: 'success',
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reports/:id
 * Get a specific report by ID
 */
export async function getReportById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    const report = await db.findReportById(id, organizationId);

    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: 'Report not found',
      });
    }

    res.json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/reports
 * Create a new report
 */
export async function createReport(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    // Validate required fields
    if (!data.title) {
      return res.status(400).json({
        status: 'error',
        message: 'title is required',
      });
    }

    // Create the report
    const report = await db.createReport({
      organizationId,
      title: data.title,
      description: data.description,
      type: data.type || 'CUSTOM',
      dateRange: data.dateRange,
      filters: data.filters,
      data: data.data,
      generatedById: userId,
    });

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'CREATED',
      entityType: 'report',
      entityId: report.id,
      description: `Created report: ${report.title}`,
    });

    res.status(201).json({
      status: 'success',
      data: report,
    });
  } catch (error) {
    next(error);
  }
}
