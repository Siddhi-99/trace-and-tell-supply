import { AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useBlockchain } from "@/lib/blockchain-context";
import { RPC_URL } from "@/lib/contract";

/** Explains connection problems (no contract, node offline, wrong network). */
export function NetworkBanner() {
  const { configured, nodeOnline, wrongNetwork, switchNetwork } = useBlockchain();
  let msg: React.ReactNode = null;
  if (!configured) msg = <>No contract deployed yet. Start Hardhat and run the deploy script — see <Link to="/about" className="underline">setup guide</Link>.</>;
  else if (nodeOnline === false) msg = <>Cannot reach the blockchain at <code className="font-mono">{RPC_URL}</code>. Run <code className="font-mono">npx hardhat node</code> on this computer.</>;
  else if (wrongNetwork) msg = <>MetaMask is on the wrong network. <button onClick={switchNetwork} className="font-medium underline">Switch to Hardhat Local</button></>;
  if (!msg) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <div>{msg}</div>
    </div>
  );
}
