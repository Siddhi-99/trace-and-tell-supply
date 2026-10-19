# ChainTrack – Blockchain-Based Product Tracking System

A decentralized app that registers products on a local Ethereum blockchain and tracks them through
**Manufactured → In Warehouse → Shipped → Delivered**. No database: all data lives in the
`ProductTracking` smart contract, and history is read from contract events.

## Structure

```text
ChainTrack/
├── blockchain/                 Hardhat project
│   ├── contracts/ProductTracking.sol
│   ├── scripts/deploy.js       deploys + writes address/ABI into src/contracts/
│   ├── test/ProductTracking.test.js  (10 tests)
│   └── hardhat.config.js
├── src/                        React web app (TanStack Start + Vite + Tailwind v4)
│   ├── routes/                 index (Dashboard), add-product, products, track, about
│   ├── components/             AppShell, WalletConnect, StatCard, StatusBadge, TrackingTimeline, ConfirmTxDialog…
│   ├── lib/blockchain.ts       ethers.js read/write helpers + error mapping
│   ├── lib/blockchain-context.tsx  MetaMask state (account, network, owner)
│   ├── lib/contract.ts         ABI, address, RPC URL, chain ID
│   └── contracts/deployment.json  written by deploy script
└── .env.example
```

> Note: routing uses TanStack Router (file-based routes) instead of React Router DOM — same pages, same behavior.

## Run it

Requires Node.js 18/20/22 LTS and the MetaMask browser extension.

```bash
# 1. Blockchain dependencies
cd blockchain && npm install

# 2. Compile + test the contract
npx hardhat compile
npx hardhat test

# 3. Start local blockchain (keep this terminal open)
npx hardhat node            # RPC http://127.0.0.1:8545, Chain ID 31337

# 4. Deploy (new terminal, in /blockchain)
npm run deploy              # writes src/contracts/deployment.json + ProductTrackingABI.json

# 5. Start the web app (project root)
npm install
npm run dev                 # open http://localhost:8080
```

## MetaMask setup

1. MetaMask → Networks → Add network manually:
   - Name: `Hardhat Local` · RPC: `http://127.0.0.1:8545` · Chain ID: `31337` · Symbol: `ETH`
   (or click **Switch network** in the app — it adds it automatically).
2. Import account: copy **Account #0** private key printed by `npx hardhat node` → MetaMask → Import account.
   Account #0 deploys the contract, so it is the **owner**.
3. If you restart `hardhat node`, re-run deploy and in MetaMask use *Settings → Advanced → Clear activity tab data* to reset nonces.

> ⚠️ **Hardhat development accounts and private keys are publicly known. Never use them with real funds or on any public network.**

## Demo walkthrough

1. Connect wallet (Account #0). A crown icon shows you're the owner.
2. **Add Product**: `PRD-1001`, "Organic Coffee Beans", "Acme Farms", Food & Beverage, a past date, description → Register → confirm → sign in MetaMask.
3. **Manage Products**: click **In Warehouse**, then **Shipped**, then **Delivered** (each is a signed transaction).
4. **Track Product**: enter `PRD-1001` — works even with no wallet connected. The timeline shows each stage's tx hash, block and timestamp.
5. Dashboard counters and chart update from on-chain data.

## How the blockchain is used (viva notes)

- **Storage**: `mapping(string => Product)` holds product data; `string[] productIds` allows listing.
- **Access control**: `onlyOwner` (registration) and `onlyAuthorized` (status updates) check `msg.sender`. The owner can add helpers with `setAuthorized(address,bool)`.
- **Business rules in code**: duplicates, empty IDs, skipped/backward stages and post-delivery changes revert with custom errors.
- **Events as audit log**: `ProductRegistered` and `ProductStatusUpdated` are emitted with `block.timestamp`; the UI queries them with `queryFilter` to build the timeline.
- **Two providers**: `JsonRpcProvider` for public read-only pages, MetaMask `BrowserProvider` signer for transactions.
- **Immutability**: once mined, records can't be altered — only new forward-moving events added.
