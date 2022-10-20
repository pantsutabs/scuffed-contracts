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
  // payment splitter - 0x16cE69F3fE7C52Aa0Fb25543a0fFD404bFDDb8f2
  // token data provider - 0x1C8dD4c50bA22ddA279F886DbF0Bd3Ee5B651526
  // scuffies - 0xde65e8C956C8A82eaE92c056Dd3c17A228048F17

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PaymentSplitter = await hre.ethers.getContractFactory("PaymentSplitter");
  const PaymentSplitter1 = await PaymentSplitter.deploy(['0xf78A448E464a1fEB693D76c9211D2d03ae488206','0xeeDb59298bFea91fF721187CbB1F2D69F0FFa091'],[50,50]);
  await PaymentSplitter1.deployed();
  
  console.log(
    `Payment splitter deployed to ${PaymentSplitter1.address}`
  );

  await new Promise(r => setTimeout(r, 30000));

  const BasicTokenDataProvider = await hre.ethers.getContractFactory("BasicTokenDataProvider");
  const BasicTokenDataProvider1 = await BasicTokenDataProvider.deploy("https://www.ipfscuffies.xyz/json/");
  await BasicTokenDataProvider1.deployed();

  console.log(
    `Token data provider deployed to ${BasicTokenDataProvider1.address}`
  );

  await new Promise(r => setTimeout(r, 30000));
  
  const ScuffedFemboys = await hre.ethers.getContractFactory("ScuffedFemboys");
  const ScuffedFemboys1 = await ScuffedFemboys.deploy("Scuffed Femboys", "SCUFF", 924, 420, PaymentSplitter1.address, BasicTokenDataProvider1.address);
  await ScuffedFemboys1.deployed();
  
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
