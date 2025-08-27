import { Prisma } from '@prisma/client';

/**
 * Provider adapter interface
 */
export interface IProviderAdapter {
  readonly name: string;
  
  /**
   * Fetch opportunities from the provider
   */
  fetch(): Promise<Prisma.YieldOpportunityCreateInput[]>;
}