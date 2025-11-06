// Type definition for Lead (temporary until Prisma client is generated)
type Lead = {
  budget?: number | string | null;
  decisionMaker?: boolean;
  timeline?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  requirements?: string | null;
};

/**
 * Calculate lead score based on various factors (0-100)
 *
 * Scoring criteria:
 * - Budget: 0-30 points (higher budget = better score)
 * - Decision Maker: 20 points
 * - Timeline urgency: 0-20 points
 * - Contact info: 0-15 points (email + phone)
 * - Company info: 10 points
 * - Requirements provided: 5 points
 */
export function calculateLeadScore(lead: Partial<Lead>): number {
  let score = 0;

  // Budget score (0-30 points)
  if (lead.budget) {
    const budgetValue = Number(lead.budget);
    if (budgetValue >= 100000) score += 30;
    else if (budgetValue >= 75000) score += 25;
    else if (budgetValue >= 50000) score += 20;
    else if (budgetValue >= 30000) score += 15;
    else if (budgetValue >= 15000) score += 10;
    else score += 5;
  }

  // Decision maker (20 points)
  if (lead.decisionMaker) {
    score += 20;
  }

  // Timeline urgency (0-20 points)
  if (lead.timeline === 'urgent') score += 20;
  else if (lead.timeline === 'soon') score += 10;
  else if (lead.timeline === 'future') score += 5;

  // Contact information (0-15 points)
  if (lead.email) score += 8;
  if (lead.phone) score += 7;

  // Company information (10 points)
  if (lead.company) score += 10;

  // Requirements provided (5 points)
  if (lead.requirements && lead.requirements.length > 20) {
    score += 5;
  }

  // Ensure score is between 0-100
  return Math.min(Math.max(score, 0), 100);
}

/**
 * Get lead quality label based on score
 */
export function getLeadQuality(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

/**
 * Update lead score
 */
export function updateLeadScore(lead: Partial<Lead>): number {
  return calculateLeadScore(lead);
}
