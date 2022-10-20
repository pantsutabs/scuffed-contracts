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
  const PaymentSplitter1 = await PaymentSplitter.attach('0xB80d7Ad713333d4C82F04e4CbA7696B6d16ED74b');
  
  const BasicTokenDataProvider = await hre.ethers.getContractFactory("BasicTokenDataProvider");
  const BasicTokenDataProvider1 = await BasicTokenDataProvider.attach('0xf826d7a8DF7702024c798469058Cb726dBAE09c6');

  const ScuffedFemboys = await hre.ethers.getContractFactory("ScuffedFemboys");
  const ScuffedFemboys1 = await ScuffedFemboys.attach('0x9288a0cCd754E11b80B15C74fA92C701DE353065');
  
  console.log(await PaymentSplitter1.connect(deployer).payee(0));
  console.log('provider',await ScuffedFemboys1.connect(deployer).tokenDataProvider());
  console.log(await BasicTokenDataProvider1.connect(deployer).baseURI());
  console.log(await ScuffedFemboys1.connect(deployer).name());
  console.log(await ScuffedFemboys1.connect(deployer).symbol());
  console.log('sale',await ScuffedFemboys1.connect(deployer).maxScuffies4Sale());
  console.log('claim',await ScuffedFemboys1.connect(deployer).maxScuffies4Claim());
  console.log('token URI 1',await ScuffedFemboys1.connect(deployer).tokenURI(1));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
