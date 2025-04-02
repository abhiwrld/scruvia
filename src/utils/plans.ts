// Plan types and utilities for Scruvia

// All available plans in the application
export type PlanType = 'free' | 'plus' | 'pro' | 'team';

// Plan configuration
export interface PlanConfig {
  name: string;
  displayName: string;
  questionLimit: number;
  price: number; // In INR
  features: string[];
  modelAccess: 'base' | 'pro';
}

// Define the plan configurations
export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: 'free',
    displayName: 'Free',
    questionLimit: 10,
    price: 0,
    features: [
      'Basic tax assistance',
      'Base model access',
      'Web search sources',
    ],
    modelAccess: 'base'
  },
  plus: {
    name: 'plus',
    displayName: 'Plus',
    questionLimit: 50,
    price: 499,
    features: [
      'Priority support',
      'Document history',
      'Base model access',
      'Web search sources',
    ],
    modelAccess: 'base'
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    questionLimit: 200,
    price: 1999,
    features: [
      'Priority support',
      'Advanced document analysis',
      'Custom tax templates',
      'Pro model access',
      'Web search sources',
    ],
    modelAccess: 'pro'
  },
  team: {
    name: 'team',
    displayName: 'Team',
    questionLimit: 500,
    price: 2499,
    features: [
      'Pro model access for all team members',
      'Collaborative workspace',
      'Admin dashboard',
      'Advanced security features',
      'Priority support',
      'Web search sources',
    ],
    modelAccess: 'pro'
  }
};

/**
 * Get the remaining questions for a user based on their plan and usage
 */
export function getRemainingQuestions(plan: string | undefined, questionsUsed: number = 0): number {
  const planType = plan as PlanType || 'free';
  const config = PLANS[planType] || PLANS.free;
  return Math.max(0, config.questionLimit - questionsUsed);
}

/**
 * Check if a plan allows access to pro models
 */
export function hasProfessionalModelAccess(plan: string | undefined): boolean {
  const planType = plan as PlanType || 'free';
  const config = PLANS[planType] || PLANS.free;
  return config.modelAccess === 'pro';
}

/**
 * Get the appropriate model for a user's plan
 */
export function getModelForPlan(plan: string | undefined): string {
  return hasProfessionalModelAccess(plan) ? 'sonar-reasoning-pro' : 'sonar';
}

/**
 * Get question limit for a specific plan
 */
export function getQuestionLimit(plan: string | undefined): number {
  const planType = plan as PlanType || 'free';
  const config = PLANS[planType] || PLANS.free;
  return config.questionLimit;
}

/**
 * Validate if a string is a valid plan type
 */
export function isValidPlan(plan: string | undefined): boolean {
  return !!plan && plan in PLANS;
}

/**
 * Get all available plans as an array
 */
export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS);
}

export default PLANS; 