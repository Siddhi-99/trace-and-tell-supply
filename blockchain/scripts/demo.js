// Optional: registers a sample product and moves it to "Shipped" for demos.
const hre = require("hardhat");
const { address } = require("../../src/contracts/deployment.json");
async function main() {
  const c = await hre.ethers.getContractAt("ProductTracking", address);
  await (await c.registerProduct("PRD-1001", "Organic Coffee Beans", "Acme Farms", "Food & Beverage", "2026-01-10", "1kg single-origin arabica")).wait();
  await (await c.updateProductStatus("PRD-1001", 1)).wait();
  await (await c.updateProductStatus("PRD-1001", 2)).wait();
  console.log("Demo product PRD-1001 created and shipped");
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
