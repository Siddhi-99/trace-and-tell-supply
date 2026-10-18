// Deploys ProductTracking and exports address + ABI to the frontend.
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Factory = await hre.ethers.getContractFactory("ProductTracking");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const { chainId } = await hre.ethers.provider.getNetwork();
  console.log("ProductTracking deployed to:", address);

  // Copy ABI + address into the frontend so the UI always matches the deployed contract.
  const artifact = await hre.artifacts.readArtifact("ProductTracking");
  const outDir = path.join(__dirname, "..", "..", "src", "contracts");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "deployment.json"),
    JSON.stringify({ address, chainId: Number(chainId), deployer: deployer.address }, null, 2),
  );
  fs.writeFileSync(path.join(outDir, "ProductTrackingABI.json"), JSON.stringify(artifact.abi, null, 2));
  console.log("Frontend config written to src/contracts/");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
