import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Coins, Filter } from "lucide-react";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

interface HeaderProps {
  currentView: 'all' | 'profile' | 'matched';
  onViewChange: (view: 'all' | 'profile' | 'matched') => void;
  matchedCount?: number;
}

export function Header({ currentView, onViewChange, matchedCount }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  DeFi Yield
                </h1>
                <p className="text-sm text-muted-foreground">Discover the best yields</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
            <Button
              variant={currentView === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('all')}
              className="flex items-center gap-2"
            >
              <Coins className="h-4 w-4" />
              All Opportunities
            </Button>
            
            <Button
              variant={currentView === 'profile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('profile')}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              My Profile
            </Button>
            
            {matchedCount !== undefined && (
              <Button
                variant={currentView === 'matched' ? 'yield' : 'outline'}
                size="sm"
                onClick={() => onViewChange('matched')}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                My Opportunities
                {matchedCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {matchedCount}
                  </Badge>
                )}
              </Button>
            )}
            </nav>
            
            <DynamicWidget />
          </div>
        </div>
      </div>
    </header>
  );
}