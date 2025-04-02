// Plan types and utilities for Scruvia

import { PerplexityModel } from './perplexity-api';

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
  model: PerplexityModel;
  canUploadFiles: boolean;
  maxFileSize: number; // in MB, 0 means unlimited
  description: string;
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
    modelAccess: 'base',
    model: 'sonar',
    canUploadFiles: false,
    maxFileSize: 0,
    description: 'Basic AI-powered tax assistance'
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
      'Unlimited file uploads',
    ],
    modelAccess: 'base',
    model: 'sonar',
    canUploadFiles: true,
    maxFileSize: 0, // 0 means unlimited
    description: 'More comprehensive tax and financial assistance'
  },
  pro: {
    name: 'Pro',
    displayName: 'Pro',
    questionLimit: 2000,
    price: 1999,
    features: [
      'Unlimited conversations',
      'Advanced tax analysis',
      'Priority support',
      'Web search sources',
      'Unlimited file uploads',
    ],
    modelAccess: 'pro',
    model: 'sonar-reasoning-pro',
    canUploadFiles: true,
    maxFileSize: 0, // 0 means unlimited
    description: 'Advanced AI-powered tax and financial assistance'
  },
  team: {
    name: 'Team',
    displayName: 'Team',
    questionLimit: 5000,
    price: 2499,
    features: [
      'Unlimited conversations',
      'Advanced tax analysis',
      'Priority support',
      'Web search sources',
      'Unlimited file uploads',
    ],
    modelAccess: 'pro',
    model: 'sonar-reasoning-pro',
    canUploadFiles: true,
    maxFileSize: 0, // 0 means unlimited
    description: 'Collaborative workspace with shared documents'
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

// Helper functions

// Check if the user's plan allows file uploads
export function canUploadFiles(plan: PlanType): boolean {
  return PLANS[plan]?.canUploadFiles || false;
}

// Get the maximum file size allowed for the plan (in MB)
export function getMaxFileSizeForPlan(plan: PlanType): number {
  // All paid plans have unlimited uploads now, so returning a large value
  return 100; // 100MB as a reasonable limit for individual files
}

// Get plan description
export function getPlanDescription(plan: PlanType): string {
  return PLANS[plan]?.description || 'Basic plan';
}

export default PLANS; 