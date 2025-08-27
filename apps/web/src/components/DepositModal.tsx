import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits } from "viem";
import { AAVE_POOL_ADDRESS, USDC_ADDRESS, erc20ABI } from "@/lib/aave-config";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityName: string;
  apr: number;
}

export function DepositModal({
  isOpen,
  onClose,
  opportunityName,
  apr,
}: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<
    "input" | "approving" | "depositing" | "success"
  >("input");

  // Reset state when modal closes
  const handleClose = () => {
    setAmount("");
    setStep("input");
    onClose();
  };

  const { address } = useAccount();
  const { toast } = useToast();

  // Check current allowance
  const { data: currentAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20ABI,
    functionName: "allowance",
    args: address && [address, AAVE_POOL_ADDRESS],
  });

  // Approval transaction with onSuccess callback
  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApproving,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        // Once approval tx is submitted, wait for confirmation
        console.log("Approval transaction submitted");
      },
      onError: (error) => {
        toast({
          title: "Approval Failed",
          description: error.message || "Failed to approve USDC spending",
          variant: "destructive",
        });
        setStep("input");
      }
    }
  });

  // Wait for approval and trigger deposit
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
      onReplaced: (response) => {
        console.log("Transaction replaced:", response);
      },
    });

  // Deposit transaction with callbacks
  const {
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositing,
  } = useWriteContract({
    mutation: {
      onSuccess: () => {
        console.log("Deposit transaction submitted");
      },
      onError: (error) => {
        toast({
          title: "Deposit Failed", 
          description: error.message || "Failed to deposit to Aave",
          variant: "destructive",
        });
        setStep("input");
      }
    }
  });

  // Wait for deposit confirmation
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } =
    useWaitForTransactionReceipt({
      hash: depositHash,
    });

  // Check if approval is needed
  const amountWei = amount ? parseUnits(amount, 6) : 0n;
  const needsApproval = amount && (!currentAllowance || BigInt(currentAllowance as string) < amountWei);

  const handleApprove = () => {
    if (!amount || !address) return;
    
    setStep("approving");
    // @ts-ignore - Wagmi v2 automatically uses connected wallet context
    approve({
      address: USDC_ADDRESS,
      abi: erc20ABI,
      functionName: "approve",
      args: [AAVE_POOL_ADDRESS, amountWei],
      gas: 100000n, // Approval needs less gas
    });
  };

  const handleDeposit = () => {
    if (!amount || !address) return;
    executeDeposit();
  };

  const executeDeposit = () => {
    if (!amount || !address) return;
    
    const amountWei = parseUnits(amount, 6);
    setStep("depositing");

    // @ts-ignore - Wagmi v2 automatically uses connected wallet context
    deposit({
      address: AAVE_POOL_ADDRESS,
      abi: [
        {
          name: "supply",
          type: "function",
          inputs: [
            { name: "asset", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "onBehalfOf", type: "address" },
            { name: "referralCode", type: "uint16" },
          ],
          outputs: [],
        },
      ] as const,
      functionName: "supply",
      args: [USDC_ADDRESS, amountWei, address, 0],
      gas: 300000n, // Set reasonable gas limit
    });
  };

  // Watch for approval success 
  if (isApprovalSuccess && step === "approving") {
    setStep("input");
    toast({
      title: "Approval Successful!",
      description: "You can now deposit your USDC",
    });
  }

  // Watch for deposit success
  if (isDepositSuccess && step === "depositing") {
    setStep("success");
    toast({
      title: "Deposit Successful!",
      description: `You've deposited ${amount} USDC to ${opportunityName}`,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit to {opportunityName}</DialogTitle>
          <DialogDescription>
            Current APR: {(apr / 100).toFixed(2)}%
          </DialogDescription>
        </DialogHeader>

        {step === "success" ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-lg font-semibold">Deposit Successful!</p>
            <p className="text-sm text-muted-foreground text-center">
              You've successfully deposited {amount} USDC
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={step !== "input"}
              />
              <p className="text-sm text-muted-foreground">
                Enter the amount of USDC you want to deposit
              </p>
            </div>

            {step === "approving" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isApprovalConfirming
                  ? "Waiting for approval confirmation..."
                  : "Please approve USDC spending in your wallet..."}
              </div>
            )}

            {step === "depositing" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isDepositConfirming
                  ? "Depositing to Aave..."
                  : "Please confirm deposit in your wallet..."}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={step !== "input"}
                className="flex-1"
              >
                Cancel
              </Button>
              
              {needsApproval && !isApprovalSuccess ? (
                <Button
                  onClick={handleApprove}
                  disabled={!amount || step !== "input" || !address || isApproving}
                  className="flex-1"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "Approve USDC"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleDeposit}
                  disabled={!amount || step !== "input" || !address || isDepositing}
                  className="flex-1"
                >
                  {isDepositing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Depositing...
                    </>
                  ) : (
                    "Deposit USDC"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
