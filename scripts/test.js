// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();
    const MSWF = await hre.ethers.getContractAt("MultiSigWalletFactory", "0x5fbdb2315678afecb367f032d93f642f64180aa3",owner);
    await MSWF.createWallet(
        "0x232ef9923665cc68c7d7f283038e6195b58678e8",
        addr1.address,
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    );
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
