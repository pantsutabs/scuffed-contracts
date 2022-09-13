// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")
const fs = require('fs').promises;

async function getRootFromClaimlist() {
  let addysStr = '';
  let preppedAddresToProof = { root: null, address: {} };

  addysStr = await fs.readFile("./claimlist.txt", "utf-8");

  // Test addys
  {
    addysStr =
`0x16ce69f3fe7c52aa0fb25543a0ffd404bfddb8f2
0x1c8dd4c50ba22dda279f886dbf0bd3ee5b651526
0xde65e8c956c8a82eae92c056dd3c17a228048f17
0x5A2Eb500ddc1C142E93617833b59fA623072d601`;
  }

  let addysArr = addysStr.split("\n");

  function arrayUnique(arr) {
    return arr.filter((v, i, a) => a.indexOf(v) === i);
  }

  function toLowerCase(arr) {
    let newArr = arr.map(function (e) {
      return e.toLowerCase();
    });

    return newArr;
  }

  addysArr = arrayUnique(addysArr);

  addysArr = toLowerCase(addysArr);

  console.log("total claimees", addysArr.length);

  {
    // Set up the merkle tree
    let addresses = addysArr;
    // Hash addresses to get the leaves
    let leaves = addresses.map(addr => keccak256(addr))
    // Create tree
    let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    // Get root
    let rootHash = merkleTree.getRoot();//.toString('hex')
    preppedAddresToProof.root = rootHash.toString('hex');

    console.log('ROOT', rootHash.toString('hex'));
    console.log(merkleTree.toString());

    addysArr.forEach(addx => {
      let hashedAddress = keccak256(addx);
      let proof = merkleTree.getHexProof(hashedAddress);
      preppedAddresToProof.address[addx] = proof;
    });

    return rootHash;
  }


}

async function main() {
  const [deployer] = await ethers.getSigners();

  // Set up the merkle tree
  /* let addresses = [
    deployer.address,
    "0x16ce69f3fe7c52aa0fb25543a0ffd404bfddb8f2",
    "0x1c8dd4c50ba22dda279f886dbf0bd3ee5b651526",
    "0xde65e8c956c8a82eae92c056dd3c17a228048f17",
  ];
  // Hash addresses to get the leaves
  let leaves = addresses.map(addr => keccak256(addr))
  let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  let rootHash = merkleTree.getRoot(); */

  const PaymentSplitter = await hre.ethers.getContractFactory("PaymentSplitter");
  const PaymentSplitter1 = await PaymentSplitter.attach('0x6a4912083e8e7b6508d0568eb3eb40a8e681e121');

  const ScuffedFemboys = await hre.ethers.getContractFactory("ScuffedFemboys");
  const ScuffedFemboys1 = await ScuffedFemboys.attach('0xA8543C6ecf3C8595Aa0755dA7236F18eFDC1a38b');

  //await ScuffedFemboys1.connect(deployer).buy(1, { value: hre.ethers.utils.parseEther("0.05") });

  //await ScuffedFemboys1.connect(deployer).setMintingStatus(true);

  // Set a root
  {
    //console.log(merkleTree.toString());
    await ScuffedFemboys1.connect(deployer).setClaimRoot(await getRootFromClaimlist()); //rootHash
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
