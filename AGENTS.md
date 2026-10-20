<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Smart contract lives in blockchain/ (Hardhat, CommonJS); its deploy script writes src/contracts/deployment.json, which the web app reads — keeps contract address/ABI in sync without manual copying.
- All product data is read from the chain via ethers (src/lib/blockchain.ts); no database — the project is a blockchain demo.
