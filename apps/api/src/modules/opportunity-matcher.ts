import { YieldOpportunity } from '@prisma/client';
import { 
  MatchOpportunitiesRequest, 
  MIN_INVESTMENT_THRESHOLDS,
  EnhancedOpportunity 
} from '../types';
import { calculateRiskScore, isAcceptableRisk } from './risk-scorer';

export class OpportunityMatcher {
  /**
   * Matches opportunities based on user criteria
   */
  static matchOpportunities(
    opportunities: YieldOpportunity[],
    request: MatchOpportunitiesRequest
  ): YieldOpportunity[] {
    const { walletBalance, riskTolerance, maxAllocationPct, investmentHorizon } = request;

    return opportunities.filter(opportunity => {
      // 1. Check risk tolerance
      const riskScore = opportunity.riskScore || calculateRiskScore(opportunity);
      if (!isAcceptableRisk(riskScore, riskTolerance)) {
        return false;
      }

      // 2. Check wallet balance for the asset
      const userBalance = this.parseBalance(walletBalance[opportunity.asset]);
      if (userBalance <= 0) {
        return false;
      }

      // 3. Check minimum investment threshold
      const minRequired = MIN_INVESTMENT_THRESHOLDS[opportunity.asset] || 
                         MIN_INVESTMENT_THRESHOLDS.DEFAULT;
      if (userBalance < minRequired) {
        return false;
      }

      // 4. Check liquidity vs investment horizon
      if (!this.matchesHorizon(opportunity.liquidity.toString(), investmentHorizon)) {
        return false;
      }

      // 5. Check allocation limits
      const maxAllocation = userBalance * (maxAllocationPct / 100);
      if (minRequired > maxAllocation) {
        return false; // Can't meet minimum with allocation limit
      }

      return true;
    });
  }

  /**
   * Determines if opportunity liquidity matches user's investment horizon
   */
  private static matchesHorizon(
    liquidity: string,
    horizonDays: number
  ): boolean {
    // Short-term (< 30 days): Only liquid opportunities
    if (horizonDays < 30) {
      return liquidity === 'liquid';
    }
    
    // Medium-term (30-90 days): Prefer liquid but accept short locks
    if (horizonDays <= 90) {
      return true; // Accept both liquid and locked
    }
    
    // Long-term (> 90 days): Accept all
    return true;
  }

  /**
   * Safely parses balance string to number
   */
  private static parseBalance(balance: string | undefined): number {
    if (!balance) return 0;
    const parsed = parseFloat(balance);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Enhanced matching with additional metadata
   */
  static matchWithMetadata(
    opportunities: YieldOpportunity[],
    request: MatchOpportunitiesRequest
  ): EnhancedOpportunity[] {
    const matched = this.matchOpportunities(opportunities, request);
    
    return matched.map(opp => {
      const userBalance = this.parseBalance(request.walletBalance[opp.asset]);
      const maxAllocation = userBalance * (request.maxAllocationPct / 100);
      
      return {
        ...opp,
        calculatedRisk: opp.riskScore || calculateRiskScore(opp),
        meetsRequirements: true,
        allocationAmount: Math.min(maxAllocation, userBalance)
      } as EnhancedOpportunity;
    });
  }

  /**
   * Sorts matched opportunities by APR (highest first)
   */
  static sortByAPR(opportunities: YieldOpportunity[]): YieldOpportunity[] {
    return [...opportunities].sort((a, b) => b.apr - a.apr);
  }

  /**
   * Sorts matched opportunities by risk (lowest first)
   */
  static sortByRisk(opportunities: YieldOpportunity[]): YieldOpportunity[] {
    return [...opportunities].sort((a, b) => {
      const riskA = a.riskScore || calculateRiskScore(a);
      const riskB = b.riskScore || calculateRiskScore(b);
      return riskA - riskB;
    });
  }
}