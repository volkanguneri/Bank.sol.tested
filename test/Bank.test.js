const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Bank Test", function () {
  let owner, user1, user2, bank;

  describe("Initialization", function () {
    // Initial state of blockchain
    beforeEach(async function () {
      [owner, user1, user2] = await ethers.getSigners();
      let contract = await hre.ethers.getContractFactory("Bank");
      bank = await contract.deploy();
    });

    it("The owner should deploy the smart contract", async function () {
      let theOwner = await bank.owner();
      assert.equal(owner.address, theOwner, "Owner addresses sould match");
    });

    describe("Deposit", function () {
      beforeEach(async function () {
        // Initial state of blockchain
        [owner, addr1, addr2] = await ethers.getSigners();
        let contract = await hre.ethers.getContractFactory("Bank");
        bank = await contract.deploy();
      });

      it("should NOT deposit Ethers if not the owner", async function () {
        let etherQuantity = ethers.parseEther("0.1");
        await expect(
          bank.connect(user1).deposit({ value: etherQuantity })
        ).to.be.revertedWithCustomError(bank, "OwnableUnauthorizedAccount");
      });

      it("should NOT deposit Ethers if not enough funds provided", async function () {
        let etherQuantity = ethers.parseEther("0.09");
        await expect(bank.deposit({ value: etherQuantity })).to.be.revertedWith(
          "Not enough funds provided"
        );
      });

      //   emit Deposit(msg.sender, msg.value);

      it("should emit an event if the owner deposits ethers", async function () {
        let etherQuantity = ethers.parseEther("0.1");
        await expect(bank.deposit({ value: etherQuantity }))
          .to.emit(bank, "Deposit")
          .withArgs(owner.address, etherQuantity);

        let balanceOfBank = await ethers.provider.getBalance(bank.target);
        assert.equal(balanceOfBank.toString(), 100000000000000000);
      });
    });

    describe("Withdraw", async function () {
      beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        let contract = await hre.ethers.getContractFactory("Bank");
        bank = await contract.deploy();

        let etherQuantity = ethers.parseEther("0.1");
        let transaction = await bank.deposit({ value: etherQuantity });
        await transaction.wait();
      });

      it("you can't withdraw if you are not the owner", async function () {
        let etherQuantity = ethers.parseEther("0.1");
        await expect(
          bank.connect(user1).withdraw(etherQuantity)
        ).to.be.revertedWithCustomError(bank, "OwnableUnauthorizedAccount");
      });

      it("You can not withdraw that much", async function () {
        let etherQuantity = ethers.parseEther("0.2");
        await expect(bank.withdraw(etherQuantity)).to.be.rejectedWith(
          "you cannot withdraw this much"
        );
      });

      it("should emit an event if the owner deposits ethers", async function () {
        let etherQuantity = ethers.parseEther("0.1");
        await expect(bank.withdraw(etherQuantity))
          .to.emit(bank, "Withdraw")
          .withArgs(owner.address, etherQuantity);
        let balanceOfBank = await ethers.provider.getBalance(bank.target);
        assert.equal(balanceOfBank.toString(), 0);
      });
    });
  });
});
