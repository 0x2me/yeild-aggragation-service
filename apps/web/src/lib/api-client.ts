import { YieldOpportunity, OpportunitiesResponse, UserProfile, MatchResponse, OpportunityFilters } from '@/types/api';

const API_URL = 'http://localhost:3001';
const API_KEY = 'dev-api-key-change-in-production';

// Cyber punk themed mock data
const MOCK_OPPORTUNITIES: YieldOpportunity[] = [
  {
    id: 'neuro-link-staking',
    name: 'NeuroLink ETH Staking',
    provider: 'cybercorp',
    asset: 'NETH',
    chain: 'ethereum',
    apr: 1250, // 12.5%
    category: 'staking',
    liquidity: 'liquid',
    riskScore: 3,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'quantum-vault',
    name: 'Quantum Yield Vault',
    provider: 'nexusfi',
    asset: 'QBT',
    chain: 'ethereum',
    apr: 1850, // 18.5%
    category: 'vault',
    liquidity: 'locked',
    riskScore: 7,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'ghost-protocol',
    name: 'Ghost Protocol Lending',
    provider: 'darknet',
    asset: 'GHOST',
    chain: 'ethereum',
    apr: 950, // 9.5%
    category: 'lending',
    liquidity: 'liquid',
    riskScore: 4,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'matrix-sol',
    name: 'Matrix SOL Staking',
    provider: 'redpill',
    asset: 'mSOL',
    chain: 'solana',
    apr: 780, // 7.8%
    category: 'staking',
    liquidity: 'liquid',
    riskScore: 2,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'cyber-synth',
    name: 'CyberSynth Protocol',
    provider: 'synapse',
    asset: 'SYNTH',
    chain: 'ethereum',
    apr: 2100, // 21%
    category: 'vault',
    liquidity: 'locked',
    riskScore: 9,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'neon-bridge',
    name: 'Neon Bridge Yield',
    provider: 'neontech',
    asset: 'NEON',
    chain: 'solana',
    apr: 1420, // 14.2%
    category: 'lending',
    liquidity: 'liquid',
    riskScore: 6,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = API_URL, apiKey: string = API_KEY) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  async getOpportunities(filters?: OpportunityFilters): Promise<OpportunitiesResponse> {
    // Return mock data with cyber punk theme
    let filteredOpportunities = [...MOCK_OPPORTUNITIES];
    
    if (filters) {
      if (filters.chain) {
        filteredOpportunities = filteredOpportunities.filter(op => op.chain === filters.chain);
      }
      if (filters.category) {
        filteredOpportunities = filteredOpportunities.filter(op => op.category === filters.category);
      }
      if (filters.sortBy === 'apr') {
        filteredOpportunities.sort((a, b) => 
          filters.order === 'asc' ? a.apr - b.apr : b.apr - a.apr
        );
      }
    }
    
    return {
      opportunities: filteredOpportunities,
      total: filteredOpportunities.length,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
      filters: filters || {}
    };
  }

  async getOpportunity(id: string): Promise<YieldOpportunity> {
    return this.request<YieldOpportunity>(`/api/earn/opportunities/${id}`);
  }

  async matchOpportunities(profile: UserProfile): Promise<MatchResponse> {
    // Mock matching logic
    const matchedOpportunities = MOCK_OPPORTUNITIES.filter(op => 
      op.riskScore <= profile.riskTolerance
    );
    
    return {
      matchedOpportunities,
      totalMatched: matchedOpportunities.length,
      filters: {
        riskTolerance: profile.riskTolerance,
        investmentHorizon: profile.investmentHorizon,
        maxAllocationPct: profile.maxAllocationPct
      }
    };
  }
}

export const apiClient = new ApiClient();

// Helper function to format APR
export function formatApr(apr: number): string {
  return `${(apr / 100).toFixed(2)}%`;
}

// Helper function to get risk color
export function getRiskColor(riskScore: number): string {
  if (riskScore <= 3) return 'risk-low';
  if (riskScore <= 6) return 'risk-medium';
  return 'risk-high';
}

// Helper function to get chain icon/color
export function getChainInfo(chain: string) {
  switch (chain) {
    case 'ethereum':
      return { color: '#627EEA', name: 'Ethereum' };
    case 'solana':
      return { color: '#9945FF', name: 'Solana' };
    default:
      return { color: '#6B7280', name: chain };
  }
}