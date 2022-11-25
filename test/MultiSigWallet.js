const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");


describe("MultiSigWallet", function () {

  async function deployFixture() {
    const [owner, server, backup, receiver] = await ethers.getSigners();
    const MSWF = await ethers.getContractFactory("MultiSigWalletFactory");
    const mswf = await MSWF.deploy();

    const owneraddr = await owner.getAddress();
    const backupaddr = await backup.getAddress();
    const serveraddr = await server.getAddress();

    await mswf.createWallet(owneraddr,backupaddr,serveraddr);

    const walletaddr = await mswf.mainMapping(owneraddr);
    const wallet = await hre.ethers.getContractAt("MultiSigWallet", walletaddr, owner);

    return { owner, server, backup, receiver, wallet, mswf, owneraddr, backupaddr, serveraddr, walletaddr };
  }


  describe("Deployment", function () {
    it("Should get correct MultiSigWallet address", async function () {
      const {mswf,owneraddr, backupaddr} = await loadFixture(deployFixture);
      expect(await mswf.mainMapping(owneraddr)).to.equal(await mswf.backupMapping(backupaddr));
    });
  });

  describe("Deposit and Withdraw", function () {
    it("Should deposit 1 ETH", async function () {
      // deposit
      const {wallet, owner, backup, server, receiver, walletaddr} = await loadFixture(deployFixture);

      const transaction = await owner.sendTransaction({
        to: walletaddr,
        value: ethers.utils.parseEther("1")
      });
      let walletbalance = await wallet.provider.getBalance(walletaddr);
      expect(walletbalance).to.equal(ethers.utils.parseEther("1"));

      // withdraw
      let initialbalance = await wallet.provider.getBalance(receiver.address);
      await wallet.submitTransaction(receiver.address, ethers.utils.parseEther("1"));
      
      let wallet2 = await wallet.connect(server);
      await wallet2.confirmTransaction(0);
      let finalbalance = await wallet.provider.getBalance(receiver.address);
      expect(finalbalance).to.equal(ethers.utils.parseEther("1").add(initialbalance));

    });
  });
});
