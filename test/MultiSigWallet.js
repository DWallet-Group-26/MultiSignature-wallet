const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");


describe("MultiSigWallet", function () {

  describe("Deployment", function () {
    it("Should get correct MultiSigWallet address", async function () {
      const [owner, server, backup, receiver] = await ethers.getSigners();

      const MSWF = await ethers.getContractFactory("MultiSigWalletFactory");
      const mswf = await MSWF.deploy();

      let owneraddr = await owner.getAddress();
      let backupaddr = await backup.getAddress();
      let serveraddr = await server.getAddress();


      await mswf.createWallet(owneraddr,backupaddr,serveraddr);
      expect(await mswf.mainMapping(owneraddr)).to.equal(await mswf.backupMapping(backupaddr));
    });
  });

  describe("Deposit and Withdraw", function () {
    it("Should deposit 1 ETH", async function () {
      // deposit
      const [owner, server, backup, receiver] = await ethers.getSigners();

      const MSWF = await ethers.getContractFactory("MultiSigWalletFactory");
      const mswf = await MSWF.deploy();

      let owneraddr = await owner.getAddress();

      let walletaddr = await mswf.mainMapping(owneraddr);
      const wallet = await ethers.getContractAt("MultiSigWallet", walletaddr);

      const transaction = await owner.sendTransaction({
        to: walletaddr,
        value: ethers.utils.parseEther("1")
      });
      let walletbalance = await wallet.provider.getBalance(walletaddr);
      expect(walletbalance).to.equal(ethers.utils.parseEther("1"));

      // withdraw
      let initialbalance = await wallet.provider.getBalance(receiver.address);

      // const wallettxstart = await wallet.connect(owner);
      let wallet1 = await ethers.getContractAt("MultiSigWallet", walletaddr,owner);
      await wallet1.submitTransaction(receiver.address, ethers.utils.parseEther("1"));
      
      let wallet2 = await ethers.getContractAt("MultiSigWallet", walletaddr,server);
      await wallet2.confirmTransaction(0);
      
      // let tx = await wallet.getTransactionCount();
      // console.log("Transaction: ", tx);

      let finalbalance = await wallet2.provider.getBalance(receiver.address);

      console.log(initialbalance);
      console.log(finalbalance);

      // expect(await wallet.provider.getBalance(receiver.address)).to.equal(ethers.utils.parseEther("1")+initialbalance);

    });
  });
});
