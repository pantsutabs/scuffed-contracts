// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const PaymentSplitter = await hre.ethers.getContractFactory("PaymentSplitter");
  const PaymentSplitter1 = await PaymentSplitter.attach('0x1C8dD4c50bA22ddA279F886DbF0Bd3Ee5B651526');
  
  const ScuffedFemboys = await hre.ethers.getContractFactory("ScuffedFemboys");
  const ScuffedFemboys1 = await ScuffedFemboys.attach('0xde65e8C956C8A82eaE92c056Dd3c17A228048F17');
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
