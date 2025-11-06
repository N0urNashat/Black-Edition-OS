import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';

/**
 * GET /api/workflows
 * Get all workflows for an organization
 */
export async function getWorkflows(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { isActive } = req.query;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    const filter: any = { organizationId };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const workflows = await db.findManyWorkflows(filter);

    res.json({
      status: 'success',
      data: workflows,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/workflows/:id
 * Get a specific workflow by ID
 */
export async function getWorkflowById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    const workflow = await db.findWorkflowById(id, organizationId);

    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found',
      });
    }

    res.json({
      status: 'success',
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/workflows
 * Create a new workflow
 */
export async function createWorkflow(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    // Validate required fields
    if (!data.name) {
      return res.status(400).json({
        status: 'error',
        message: 'name is required',
      });
    }

    if (!data.trigger) {
      return res.status(400).json({
        status: 'error',
        message: 'trigger is required',
      });
    }

    // Create the workflow
    const workflow = await db.createWorkflow({
      organizationId,
      name: data.name,
      description: data.description,
      trigger: data.trigger,
      actions: data.actions || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdById: userId,
    });

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'CREATED',
      entityType: 'workflow',
      entityId: workflow.id,
      description: `Created workflow: ${workflow.name}`,
    });

    res.status(201).json({
      status: 'success',
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/workflows/:id
 * Update a workflow (e.g., toggle active/inactive)
 */
export async function updateWorkflow(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    const workflow = await db.updateWorkflow(id, organizationId, data);

    if (!workflow) {
      return res.status(404).json({
        status: 'error',
        message: 'Workflow not found',
      });
    }

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'UPDATED',
      entityType: 'workflow',
      entityId: workflow.id,
      description: `Updated workflow: ${workflow.name}`,
    });

    res.json({
      status: 'success',
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
}
