const { expect } = require("chai");
const hre = require("hardhat");

describe("ExampleContract", function () {
  let ExampleContract;
  let exampleContract;
  let owner;
  let addr1;
  const initialGreeting = "Hello, BlockGuardian!";

  beforeEach(async function () {
    [owner, addr1] = await hre.ethers.getSigners();
    ExampleContract = await hre.ethers.getContractFactory("ExampleContract");
    exampleContract = await ExampleContract.deploy(initialGreeting);
    await exampleContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await exampleContract.getOwner()).to.equal(owner.address);
    });

    it("Should set the initial greeting", async function () {
      expect(await exampleContract.getGreeting()).to.equal(initialGreeting);
    });
  });

  describe("Transactions", function () {
    it("Should allow owner to change greeting", async function () {
      const newGreeting = "Hola, BlockGuardian!";
      await exampleContract.connect(owner).setGreeting(newGreeting);
      expect(await exampleContract.getGreeting()).to.equal(newGreeting);
    });

    it("Should emit GreetingChanged event when greeting is changed", async function () {
      const newGreeting = "Bonjour, BlockGuardian!";
      await expect(exampleContract.connect(owner).setGreeting(newGreeting))
        .to.emit(exampleContract, "GreetingChanged")
        .withArgs(newGreeting, owner.address);
    });

    it("Should not allow non-owner to change greeting", async function () {
      const newGreeting = "Hallo, BlockGuardian!";
      await expect(exampleContract.connect(addr1).setGreeting(newGreeting))
        .to.be.revertedWith("Only owner can change the greeting");
    });

    it("Should allow owner to transfer ownership", async function () {
      await exampleContract.connect(owner).transferOwnership(addr1.address);
      expect(await exampleContract.getOwner()).to.equal(addr1.address);
    });

    it("Should emit OwnershipTransferred event when ownership is transferred", async function () {
      await expect(exampleContract.connect(owner).transferOwnership(addr1.address))
        .to.emit(exampleContract, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      await expect(exampleContract.connect(addr1).transferOwnership(addr1.address))
        .to.be.revertedWith("Only current owner can transfer ownership");
    });
  });
});

