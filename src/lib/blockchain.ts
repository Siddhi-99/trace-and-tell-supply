import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import { CONTRACT_ADDRESS, PRODUCT_TRACKING_ABI, RPC_URL } from "./contract";

export type Product = {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  manufacturingDate: string;
  description: string;
  status: number;
  registeredAt: number;
  updatedAt: number;
  registeredBy: string;
};

export type HistoryEntry = {
  productId: string;
  status: number;
  type: "registered" | "updated";
  by: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
};

let readProvider: JsonRpcProvider | null = null;

/** Read-only provider: used for public pages, no wallet needed. */
export function getReadProvider() {
  if (!readProvider) readProvider = new JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true });
  return readProvider;
}

export function getReadContract(): any {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured. Run `npm run deploy` in /blockchain.");
  return new Contract(CONTRACT_ADDRESS, PRODUCT_TRACKING_ABI, getReadProvider());
}

/** Write contract: signs transactions with the user's MetaMask account. */
export async function getWriteContract(): Promise<any> {
  const eth = (window as unknown as { ethereum?: unknown }).ethereum;
  if (!eth) throw new Error("MetaMask is not installed.");
  const provider = new BrowserProvider(eth as never);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, PRODUCT_TRACKING_ABI, signer);
}

function toProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.name,
    manufacturer: raw.manufacturer,
    category: raw.category,
    manufacturingDate: raw.manufacturingDate,
    description: raw.description,
    status: Number(raw.status),
    registeredAt: Number(raw.registeredAt),
    updatedAt: Number(raw.updatedAt),
    registeredBy: raw.registeredBy,
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  const c = getReadContract();
  const ids: string[] = await c.getAllProductIds();
  const items = await Promise.all(ids.map((id) => c.getProduct(id)));
  return items.map(toProduct);
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const c = getReadContract();
  const exists: boolean = await c.productExists(id);
  if (!exists) return null;
  return toProduct(await c.getProduct(id));
}

/** Reads event logs. Pass a productId to filter, or omit for all activity. */
export async function fetchHistory(productId?: string): Promise<HistoryEntry[]> {
  const c = getReadContract();
  const [reg, upd] = await Promise.all([
    c.queryFilter(productId ? c.filters.ProductRegistered(productId) : c.filters.ProductRegistered(), 0, "latest"),
    c.queryFilter(productId ? c.filters.ProductStatusUpdated(productId) : c.filters.ProductStatusUpdated(), 0, "latest"),
  ]);
  const entries: HistoryEntry[] = [
    ...reg.map((l: any) => ({
      productId: l.args.productId,
      status: 0,
      type: "registered" as const,
      by: l.args.registeredBy,
      timestamp: Number(l.args.timestamp),
      txHash: l.transactionHash,
      blockNumber: l.blockNumber,
    })),
    ...upd.map((l: any) => ({
      productId: l.args.productId,
      status: Number(l.args.newStatus),
      type: "updated" as const,
      by: l.args.updatedBy,
      timestamp: Number(l.args.timestamp),
      txHash: l.transactionHash,
      blockNumber: l.blockNumber,
    })),
  ];
  return entries.sort((a, b) => a.blockNumber - b.blockNumber);
}

/** Turns ethers / contract errors into friendly messages. */
export function friendlyError(err: any): string {
  if (err?.code === "ACTION_REJECTED" || err?.info?.error?.code === 4001) return "Transaction rejected in MetaMask.";
  const name = err?.revert?.name;
  const map: Record<string, string> = {
    NotOwner: "Only the contract owner can register products.",
    NotAuthorized: "This wallet is not authorized to update products.",
    EmptyProductId: "Product ID cannot be empty.",
    EmptyField: "A required field is empty.",
    ProductAlreadyExists: "A product with this ID already exists.",
    ProductNotFound: "Product not found on the blockchain.",
    InvalidStatusTransition: "Invalid status change. Stages must move forward one step at a time.",
    AlreadyDelivered: "This product is already delivered and can't change.",
  };
  if (name && map[name]) return map[name];
  if (err?.code === "NETWORK_ERROR" || /failed to fetch|ECONNREFUSED/i.test(String(err?.message)))
    return "Cannot reach the blockchain. Is `npx hardhat node` running?";
  return err?.shortMessage || err?.message || "Something went wrong.";
}

export const shortAddr = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
export const fmtTime = (s: number) => (s ? new Date(s * 1000).toLocaleString() : "—");
