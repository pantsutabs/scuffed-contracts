// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const ScuffedFemboys = await hre.ethers.getContractFactory("ScuffedFemboys");
  const ScuffedFemboys1 = await ScuffedFemboys.attach('0xA8543C6ecf3C8595Aa0755dA7236F18eFDC1a38b');

  const ScuffedFemboys = await hre.ethers.getContractFactory("ScuffedFemboys");
  const ScuffedFemboys1 = await ScuffedFemboys.attach('0xde65e8C956C8A82eaE92c056Dd3c17A228048F17');

  //await ScuffedFemboys1.connect(deployer).setMintingStatus(true);

  await ScuffedFemboys1.connect(deployer).buy(1, { value: hre.ethers.utils.parseEther("0.05") });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
