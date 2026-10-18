import { Wallet, AlertTriangle, Crown } from "lucide-react";
import { useBlockchain } from "@/lib/blockchain-context";
import { shortAddr } from "@/lib/blockchain";

export function WalletConnect() {
  const { account, connect, wrongNetwork, switchNetwork, isOwner, hasMetaMask } = useBlockchain();
  if (!account)
    return (
      <button onClick={connect} className="btn btn-primary">
        <Wallet className="h-4 w-4" /> <span className="hidden sm:inline">{hasMetaMask ? "Connect Wallet" : "Install MetaMask"}</span>
      </button>
    );
  if (wrongNetwork)
    return (
      <button onClick={switchNetwork} className="btn bg-warning text-warning-foreground">
        <AlertTriangle className="h-4 w-4" /> Switch network
      </button>
    );
  return (
    <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-card">
      <span className="h-2 w-2 rounded-full bg-success" />
      <span className="font-mono">{shortAddr(account)}</span>
      {isOwner && <span title="Contract owner"><Crown className="h-3.5 w-3.5 text-warning" /></span>}
    </div>
  );
}
