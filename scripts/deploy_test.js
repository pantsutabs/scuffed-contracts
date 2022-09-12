// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PaymentSplitter = await hre.ethers.getContractFactory("PaymentSplitter");
  const PaymentSplitter1 = await PaymentSplitter.deploy([deployer.address],[100]);
  await PaymentSplitter1.deployed();

  await new Promise(r => setTimeout(r, 60000));
  
  const ScuffedFemboys = await hre.ethers.getContractFactory("ScuffedFemboys");
  const ScuffedFemboys1 = await ScuffedFemboys.deploy("Scuffed Femboys", "SCUFFED", 100, 10, PaymentSplitter1.address);
  await ScuffedFemboys1.deployed();
  
  console.log(
    `Payment splitter deployed to ${PaymentSplitter1.address}`
  );

  console.log(
    `Scuffed femboys deployed to ${ScuffedFemboys1.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
