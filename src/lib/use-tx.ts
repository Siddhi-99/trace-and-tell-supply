import { useState } from "react";
import { toast } from "sonner";
import { friendlyError, getWriteContract } from "./blockchain";
import { useBlockchain } from "./blockchain-context";
import { shortAddr } from "./blockchain";

/**
 * Sends a wallet-signed transaction, shows pending/confirmed toasts with the tx hash,
 * then refreshes all on-chain data.
 */
export function useTx() {
  const { refresh, wrongNetwork, account } = useBlockchain();
  const [pending, setPending] = useState(false);

  async function send(label: string, fn: (c: Awaited<ReturnType<typeof getWriteContract>>) => Promise<any>) {
    if (!account) return toast.error("Connect your wallet first"), false;
    if (wrongNetwork) return toast.error("Wrong network. Switch to Hardhat Local."), false;
    setPending(true);
    const id = toast.loading(`${label}: waiting for MetaMask…`);
    try {
      const contract = await getWriteContract();
      const tx = await fn(contract);
      toast.loading(`${label}: confirming tx ${shortAddr(tx.hash)}…`, { id });
      const receipt = await tx.wait();
      toast.success(`${label} confirmed in block #${receipt.blockNumber}`, { id, description: `Tx: ${tx.hash}` });
      refresh();
      return true;
    } catch (e) {
      toast.error(friendlyError(e), { id });
      return false;
    } finally {
      setPending(false);
    }
  }
  return { send, pending };
}
