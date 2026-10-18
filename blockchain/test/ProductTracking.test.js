const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("ProductTracking", function () {
  let contract, owner, other;
  const args = ["P-001", "Organic Coffee", "Acme Farms", "Food", "2026-01-10", "1kg arabica beans"];

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    contract = await (await ethers.getContractFactory("ProductTracking")).deploy();
  });

  it("1. registers a product", async function () {
    await contract.registerProduct(...args);
    expect(await contract.productExists("P-001")).to.equal(true);
    expect(await contract.getAllProductIds()).to.deep.equal(["P-001"]);
  });

  it("2. rejects duplicate product IDs", async function () {
    await contract.registerProduct(...args);
    await expect(contract.registerProduct(...args))
      .to.be.revertedWithCustomError(contract, "ProductAlreadyExists");
  });

  it("3. rejects empty product ID", async function () {
    await expect(contract.registerProduct("", ...args.slice(1)))
      .to.be.revertedWithCustomError(contract, "EmptyProductId");
  });

  it("4. rejects registration from non-owner", async function () {
    await expect(contract.connect(other).registerProduct(...args))
      .to.be.revertedWithCustomError(contract, "NotOwner");
  });

  it("5. updates status to the next stage", async function () {
    await contract.registerProduct(...args);
    await contract.updateProductStatus("P-001", 1);
    expect((await contract.getProduct("P-001")).status).to.equal(1n);
  });

  it("6. rejects skipped, backward and post-delivery transitions", async function () {
    await contract.registerProduct(...args);
    await expect(contract.updateProductStatus("P-001", 2))
      .to.be.revertedWithCustomError(contract, "InvalidStatusTransition");
    await contract.updateProductStatus("P-001", 1);
    await expect(contract.updateProductStatus("P-001", 0))
      .to.be.revertedWithCustomError(contract, "InvalidStatusTransition");
    await contract.updateProductStatus("P-001", 2);
    await contract.updateProductStatus("P-001", 3);
    await expect(contract.updateProductStatus("P-001", 3))
      .to.be.revertedWithCustomError(contract, "AlreadyDelivered");
  });

  it("7. rejects status update from unauthorized wallet, allows authorized one", async function () {
    await contract.registerProduct(...args);
    await expect(contract.connect(other).updateProductStatus("P-001", 1))
      .to.be.revertedWithCustomError(contract, "NotAuthorized");
    await contract.setAuthorized(other.address, true);
    await contract.connect(other).updateProductStatus("P-001", 1);
    expect((await contract.getProduct("P-001")).status).to.equal(1n);
  });

  it("8. retrieves stored product details", async function () {
    await contract.registerProduct(...args);
    const p = await contract.getProduct("P-001");
    expect(p.name).to.equal("Organic Coffee");
    expect(p.manufacturer).to.equal("Acme Farms");
    expect(p.category).to.equal("Food");
    expect(p.registeredBy).to.equal(owner.address);
    await expect(contract.getProduct("NOPE")).to.be.revertedWithCustomError(contract, "ProductNotFound");
  });

  it("9. emits ProductRegistered", async function () {
    await expect(contract.registerProduct(...args))
      .to.emit(contract, "ProductRegistered")
      .withArgs(anyValue, "P-001", "Organic Coffee", owner.address, anyValue);
  });

  it("10. emits ProductStatusUpdated", async function () {
    await contract.registerProduct(...args);
    await expect(contract.updateProductStatus("P-001", 1))
      .to.emit(contract, "ProductStatusUpdated")
      .withArgs(anyValue, "P-001", 0, 1, owner.address, anyValue);
  });
});
