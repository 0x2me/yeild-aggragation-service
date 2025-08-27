import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEther } from "viem";

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
  });

  return (
    <div className="flex flex-col gap-4">
      <DynamicWidget />
      
      {isConnected && address && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Address: </span>
              <span className="font-mono text-xs">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            
            {chain && (
              <div className="text-sm">
                <span className="font-medium">Network: </span>
                <span>{chain.name}</span>
              </div>
            )}
            
            {balance && (
              <div className="text-sm">
                <span className="font-medium">Balance: </span>
                <span>{parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}</span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => disconnect()}
              className="mt-2"
            >
              Disconnect
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}