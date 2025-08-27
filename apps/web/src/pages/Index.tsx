import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { OpportunityCard } from "@/components/OpportunityCard";
import { UserProfileForm } from "@/components/UserProfileForm";
import { OpportunityFilters } from "@/components/OpportunityFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { YieldOpportunity, UserProfile, OpportunityFilters as FilterType } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, AlertCircle, Sparkles, Target } from "lucide-react";

type ViewType = 'all' | 'profile' | 'matched';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('all');
  const [filters, setFilters] = useState<FilterType>({
    sortBy: 'apr',
    order: 'desc',
    limit: 50
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [matchedOpportunities, setMatchedOpportunities] = useState<YieldOpportunity[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  
  const { toast } = useToast();

  // Create particle effect
  useEffect(() => {
    if (currentView === 'all') {
      const createParticleEffect = () => {
        const container = document.getElementById('particles-bg');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Create floating cyber particles
        for (let i = 0; i < 40; i++) {
          const particle = document.createElement('div');
          const colors = ['#00FFFF', '#FF00FF', '#FFFF00']; // Cyan, Magenta, Yellow
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          particle.style.cssText = `
            position: absolute;
            width: ${2 + Math.random() * 3}px;
            height: ${2 + Math.random() * 3}px;
            background: ${color};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${0.3 + Math.random() * 0.4};
            box-shadow: 0 0 ${5 + Math.random() * 10}px ${color};
            animation: cyber-float ${4 + Math.random() * 6}s infinite ease-in-out;
            animation-delay: ${Math.random() * 2}s;
          `;
          container.appendChild(particle);
        }
        
        // Create connecting lines effect
        for (let i = 0; i < 15; i++) {
          const line = document.createElement('div');
          line.style.cssText = `
            position: absolute;
            width: ${50 + Math.random() * 100}px;
            height: 1px;
            background: linear-gradient(90deg, transparent, #00FFFF, transparent);
            left: ${Math.random() * 80}%;
            top: ${Math.random() * 80}%;
            opacity: 0.2;
            animation: cyber-pulse ${3 + Math.random() * 4}s infinite ease-in-out;
            animation-delay: ${Math.random() * 3}s;
            transform: rotate(${Math.random() * 360}deg);
          `;
          container.appendChild(line);
        }
      };
      
      createParticleEffect();
    }
  }, [currentView]);

  // Fetch all opportunities
  const { data: opportunitiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => apiClient.getOpportunities(filters),
    refetchInterval: 60000, // Refetch every minute
  });

  const handleProfileSubmit = async (profile: UserProfile) => {
    setUserProfile(profile);
    setIsMatching(true);
    
    try {
      const response = await apiClient.matchOpportunities(profile);
      setMatchedOpportunities(response.matchedOpportunities);
      setCurrentView('matched');
      
      toast({
        title: "Profile Matched!",
        description: `Found ${response.matchedOpportunities.length} opportunities matching your profile.`,
      });
    } catch (error) {
      toast({
        title: "Matching Failed",
        description: error instanceof Error ? error.message : "Failed to match opportunities",
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'apr',
      order: 'desc',
      limit: 50
    });
  };

  const OpportunitiesSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </Card>
      ))}
    </div>
  );

  const renderHeroSection = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background border-b border-border/50">
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div id="particles-bg" className="absolute inset-0 pointer-events-none"></div>
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 p-4 rounded-2xl shadow-glow animate-pulse">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Enter the DeFi Matrix
          </h1>
          <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
            Jack into the highest yielding opportunities across the blockchain networks. 
            Our neural matching system finds cyber-enhanced yields tailored to your risk neural pattern.
          </p>
          <div className="flex justify-center">
            <Button
              variant="hero"
              size="lg"
              onClick={() => setCurrentView('profile')}
              className="px-8 backdrop-blur-sm"
            >
              <Target className="h-5 w-5 mr-2" />
              Get Personalized Recommendations
            </Button>
          </div>
          
          {opportunitiesData && (
            <div className="flex justify-center gap-8 mt-12 pt-8 border-t border-border/30">
              <div className="text-center">
                <div className="text-3xl font-bold text-yield-green">
                  {opportunitiesData.opportunities.length}
                </div>
                <div className="text-sm text-muted-foreground">Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yield-green">
                  {Math.max(...opportunitiesData.opportunities.map(o => o.apr / 100)).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Max APR</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yield-green">2</div>
                <div className="text-sm text-muted-foreground">Blockchains</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (currentView === 'profile') {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Set Your Investment Profile</h2>
            <p className="text-muted-foreground">
              Tell us about your preferences to get personalized yield recommendations
            </p>
          </div>
          <UserProfileForm onSubmit={handleProfileSubmit} isLoading={isMatching} />
        </div>
      );
    }

    if (currentView === 'matched') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <TrendingUp className="h-8 w-8 text-yield-green" />
              Your Matched Opportunities
            </h2>
            <p className="text-muted-foreground mb-6">
              {matchedOpportunities.length} opportunities matching your risk profile
            </p>
            {userProfile && (
              <div className="flex justify-center gap-4 flex-wrap">
                <Badge variant="outline">Risk Tolerance: {userProfile.riskTolerance}/10</Badge>
                <Badge variant="outline">Max Allocation: {userProfile.maxAllocationPct}%</Badge>
                <Badge variant="outline">Horizon: {userProfile.investmentHorizon} days</Badge>
              </div>
            )}
          </div>

          {matchedOpportunities.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No opportunities match your current profile. Try adjusting your risk tolerance or investment horizon.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  showActions={true}
                />
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setCurrentView('profile')}
            >
              Update Profile
            </Button>
          </div>
        </div>
      );
    }

    // All opportunities view
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">All Yield Opportunities</h2>
          <p className="text-muted-foreground">
            Explore all available opportunities across DeFi protocols
          </p>
        </div>

        <OpportunityFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load opportunities. Please try again.
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <OpportunitiesSkeleton />
        ) : opportunitiesData?.opportunities.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No opportunities found with current filters.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunitiesData?.opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        matchedCount={matchedOpportunities.length}
      />
      
      {currentView === 'all' && renderHeroSection()}
      
      <main className="container mx-auto px-4 py-12">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;