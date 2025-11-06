import { z } from 'zod';

// Lead creation schema
export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().nullable(),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    website: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
    source: z.enum(['website', 'referral', 'social', 'cold-outreach', 'other']).optional(),
    budget: z.number().positive('Budget must be positive').optional().nullable(),
    timeline: z.enum(['urgent', 'soon', 'future']).optional(),
    decisionMaker: z.boolean().default(false),
    requirements: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    assignedToId: z.string().optional().nullable(),
  }),
});

// Lead update schema
export const updateLeadSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional().nullable(),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    website: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional(),
    source: z.enum(['website', 'referral', 'social', 'cold-outreach', 'other']).optional(),
    budget: z.number().positive('Budget must be positive').optional().nullable(),
    timeline: z.enum(['urgent', 'soon', 'future']).optional(),
    decisionMaker: z.boolean().optional(),
    requirements: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    assignedToId: z.string().optional().nullable(),
  }).partial(),
});

// Lead query schema
export const getLeadsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional(),
    assignedToId: z.string().optional(),
    minScore: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxScore: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(), // Search by name, company, or email
    sortBy: z.enum(['createdAt', 'updatedAt', 'score', 'name']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// Lead ID param schema
export const leadIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid lead ID'),
  }),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>['body'];
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>['body'];
export type GetLeadsQuery = z.infer<typeof getLeadsSchema>['query'];
