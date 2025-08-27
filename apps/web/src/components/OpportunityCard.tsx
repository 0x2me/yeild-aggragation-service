import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YieldOpportunity } from "@/types/api";
import { formatApr, getRiskColor, getChainInfo } from "@/lib/api-client";
import { TrendingUp, Shield, Clock, Coins } from "lucide-react";

interface OpportunityCardProps {
  opportunity: YieldOpportunity;
  onSelect?: (opportunity: YieldOpportunity) => void;
  showActions?: boolean;
}

export function OpportunityCard({ opportunity, onSelect, showActions = false }: OpportunityCardProps) {
  const chainInfo = getChainInfo(opportunity.chain);
  const riskColorClass = getRiskColor(opportunity.riskScore);

  return (
    <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {opportunity.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {opportunity.provider}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: chainInfo.color }}
              >
                {chainInfo.name}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-2xl font-bold text-yield-green">
              <TrendingUp className="h-5 w-5" />
              {formatApr(opportunity.apr)}
            </div>
            <p className="text-xs text-muted-foreground">APR</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{opportunity.asset}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge 
                variant={opportunity.liquidity === 'liquid' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {opportunity.liquidity}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1">
                <span className="text-sm">Risk</span>
                <Badge 
                  className={`text-xs bg-${riskColorClass} border-${riskColorClass}`}
                  variant="outline"
                >
                  {opportunity.riskScore}/10
                </Badge>
              </div>
            </div>
            <Badge variant="outline" className="text-xs w-fit capitalize">
              {opportunity.category}
            </Badge>
          </div>
        </div>

        {showActions && (
          <div className="pt-2 border-t border-border/50">
            <Button 
              variant="glow" 
              size="sm" 
              className="w-full"
              onClick={() => onSelect?.(opportunity)}
            >
              Select Opportunity
            </Button>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Updated {new Date(opportunity.updatedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}