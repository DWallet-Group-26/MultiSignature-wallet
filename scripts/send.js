// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const addr = "0xbd89205d29cd2454d6d1664d58a7cc0af0fec026";
  const value = "1.0"

  const [owner, addr1, addr2] = await hre.ethers.getSigners();
  owner.sendTransaction({ from: owner.address, to: addr, value: hre.ethers.utils.parseEther(value) });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
