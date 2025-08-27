import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types/api";
import { User, Wallet, Target, Calendar } from "lucide-react";

interface UserProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading?: boolean;
}

export function UserProfileForm({ onSubmit, isLoading }: UserProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>({
    walletBalance: {
      ETH: "5.0",
      SOL: "100",
      USDC: "10000"
    },
    riskTolerance: 5,
    maxAllocationPct: 25,
    investmentHorizon: 90
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  const updateWalletBalance = (asset: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      walletBalance: {
        ...prev.walletBalance,
        [asset]: value
      }
    }));
  };

  const getRiskLabel = (risk: number) => {
    if (risk <= 2) return "Very Conservative";
    if (risk <= 4) return "Conservative";
    if (risk <= 6) return "Moderate";
    if (risk <= 8) return "Aggressive";
    return "Very Aggressive";
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Your Profile
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Balance */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4" />
              Wallet Balance
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(profile.walletBalance).map(([asset, balance]) => (
                <div key={asset} className="space-y-2">
                  <Label htmlFor={asset} className="text-xs text-muted-foreground">
                    {asset}
                  </Label>
                  <Input
                    id={asset}
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={(e) => updateWalletBalance(asset, e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Risk Tolerance */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              Risk Tolerance
            </Label>
            <div className="space-y-3">
              <Slider
                value={[profile.riskTolerance]}
                onValueChange={(value) => setProfile(prev => ({ ...prev, riskTolerance: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  {profile.riskTolerance}/10
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getRiskLabel(profile.riskTolerance)}
                </span>
              </div>
            </div>
          </div>

          {/* Max Allocation */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              Max Allocation per Opportunity
            </Label>
            <div className="space-y-3">
              <Slider
                value={[profile.maxAllocationPct]}
                onValueChange={(value) => setProfile(prev => ({ ...prev, maxAllocationPct: value[0] }))}
                max={100}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  {profile.maxAllocationPct}%
                </Badge>
                <span className="text-sm text-muted-foreground">
                  of total portfolio
                </span>
              </div>
            </div>
          </div>

          {/* Investment Horizon */}
          <div className="space-y-3">
            <Label htmlFor="horizon" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Investment Horizon (days)
            </Label>
            <Input
              id="horizon"
              type="number"
              min="1"
              value={profile.investmentHorizon}
              onChange={(e) => setProfile(prev => ({ ...prev, investmentHorizon: parseInt(e.target.value) || 1 }))}
              className="bg-muted/30 border-border/50"
            />
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Finding Opportunities..." : "Find My Opportunities"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}