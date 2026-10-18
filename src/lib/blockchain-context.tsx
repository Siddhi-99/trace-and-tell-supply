import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CHAIN_ID, CHAIN_ID_HEX, CONTRACT_ADDRESS, RPC_URL } from "./contract";
import { getReadContract } from "./blockchain";

type Eth = {
  request: (a: { method: string; params?: unknown[] }) => Promise<any>;
  on: (e: string, cb: (...a: any[]) => void) => void;
  removeListener: (e: string, cb: (...a: any[]) => void) => void;
};

type Ctx = {
  hasMetaMask: boolean;
  account: string | null;
  chainId: number | null;
  wrongNetwork: boolean;
  owner: string | null;
  isOwner: boolean;
  canUpdate: boolean;
  nodeOnline: boolean | null;
  configured: boolean;
  refreshKey: number;
  refresh: () => void;
  connect: () => Promise<void>;
  switchNetwork: () => Promise<void>;
};

const BlockchainContext = createContext<Ctx | null>(null);
const getEth = () => (typeof window === "undefined" ? undefined : (window as any).ethereum as Eth | undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [hasMetaMask, setHas] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [nodeOnline, setNodeOnline] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Detect wallet, existing connection, account & network changes.
  useEffect(() => {
    const eth = getEth();
    setHas(!!eth);
    if (!eth) return;
    eth.request({ method: "eth_accounts" }).then((a: string[]) => setAccount(a[0] ?? null)).catch(() => {});
    eth.request({ method: "eth_chainId" }).then((c: string) => setChainId(parseInt(c, 16))).catch(() => {});
    const onAcc = (a: string[]) => {
      setAccount(a[0] ?? null);
      if (!a[0]) toast.info("Wallet disconnected");
      else toast.info(`Switched to account ${a[0].slice(0, 6)}…`);
    };
    const onChain = (c: string) => setChainId(parseInt(c, 16));
    eth.on("accountsChanged", onAcc);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener("accountsChanged", onAcc);
      eth.removeListener("chainChanged", onChain);
    };
  }, []);

  // Read contract owner + check node is reachable.
  useEffect(() => {
    if (!CONTRACT_ADDRESS) return setNodeOnline(null);
    const c = getReadContract();
    c.owner()
      .then((o: string) => {
        setOwner(o);
        setNodeOnline(true);
      })
      .catch(() => setNodeOnline(false));
  }, [refreshKey]);

  useEffect(() => {
    if (!account || !CONTRACT_ADDRESS || !nodeOnline) return setAuthorized(false);
    getReadContract().authorized(account).then(setAuthorized).catch(() => setAuthorized(false));
  }, [account, nodeOnline, refreshKey]);

  const connect = async () => {
    const eth = getEth();
    if (!eth) {
      toast.error("MetaMask is not installed. Get it at metamask.io");
      return;
    }
    try {
      const a: string[] = await eth.request({ method: "eth_requestAccounts" });
      setAccount(a[0] ?? null);
      toast.success("Wallet connected");
    } catch {
      toast.error("Wallet connection rejected");
    }
  };

  const switchNetwork = async () => {
    const eth = getEth();
    if (!eth) return;
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_ID_HEX }] });
    } catch (e: any) {
      if (e?.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: CHAIN_ID_HEX,
            chainName: "Hardhat Local",
            rpcUrls: [RPC_URL],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          }],
        });
      } else toast.error("Could not switch network");
    }
  };

  const isOwner = !!account && !!owner && account.toLowerCase() === owner.toLowerCase();
  return (
    <BlockchainContext.Provider
      value={{
        hasMetaMask, account, chainId, owner, isOwner, nodeOnline, refreshKey, refresh, connect, switchNetwork,
        wrongNetwork: !!account && chainId !== null && chainId !== CHAIN_ID,
        canUpdate: isOwner || authorized,
        configured: !!CONTRACT_ADDRESS,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const c = useContext(BlockchainContext);
  if (!c) throw new Error("useBlockchain must be inside BlockchainProvider");
  return c;
}
