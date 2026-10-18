import deployment from "@/contracts/deployment.json";

/**
 * Contract configuration.
 * - Address comes from VITE_CONTRACT_ADDRESS, falling back to the file written by
 *   `npm run deploy` (src/contracts/deployment.json).
 * - RPC URL / chain ID default to the local Hardhat node.
 */
export const CONTRACT_ADDRESS: string =
  (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) || deployment.address || "";
export const RPC_URL: string =
  (import.meta.env.VITE_RPC_URL as string | undefined) || "http://127.0.0.1:8545";
export const CHAIN_ID: number = Number(import.meta.env.VITE_CHAIN_ID || deployment.chainId || 31337);
export const CHAIN_ID_HEX = "0x" + CHAIN_ID.toString(16);

// Human-readable ABI (matches blockchain/contracts/ProductTracking.sol)
export const PRODUCT_TRACKING_ABI = [
  "function owner() view returns (address)",
  "function authorized(address) view returns (bool)",
  "function setAuthorized(address account, bool allowed)",
  "function registerProduct(string _id, string _name, string _manufacturer, string _category, string _manufacturingDate, string _description)",
  "function updateProductStatus(string _id, uint8 _newStatus)",
  "function getProduct(string _id) view returns (tuple(string id, string name, string manufacturer, string category, string manufacturingDate, string description, uint8 status, uint256 registeredAt, uint256 updatedAt, address registeredBy))",
  "function getAllProductIds() view returns (string[])",
  "function productExists(string _id) view returns (bool)",
  "function getProductCount() view returns (uint256)",
  "event ProductRegistered(string indexed productIdKey, string productId, string name, address indexed registeredBy, uint256 timestamp)",
  "event ProductStatusUpdated(string indexed productIdKey, string productId, uint8 previousStatus, uint8 newStatus, address indexed updatedBy, uint256 timestamp)",
  "error NotOwner()",
  "error NotAuthorized()",
  "error EmptyProductId()",
  "error EmptyField(string field)",
  "error ProductAlreadyExists(string productId)",
  "error ProductNotFound(string productId)",
  "error InvalidStatusTransition(uint8 current, uint8 requested)",
  "error AlreadyDelivered(string productId)",
];

export const STATUSES = ["Manufactured", "In Warehouse", "Shipped", "Delivered"] as const;
export type StatusIndex = 0 | 1 | 2 | 3;
