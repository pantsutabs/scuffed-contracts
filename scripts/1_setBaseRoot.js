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

// TODO: copy paste latest one from the merkle script
async function getRootFromClaimlistAndSave() {
  let addysStr = '';
  let preppedAddresToProof = { root: null, address: {} };

  addysStr = await fs.readFile("./claimlist.txt", "utf-8");

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

    await fs.writeFile('./claimMerkleProofs.json', JSON.stringify(preppedAddresToProof), err => {
      if (err) {
        console.error(err);
        throw err;
      }
      // file written successfully
    });

    return rootHash;
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();

  const ScuffedFemboys = await hre.ethers.getContractFactory("ScuffedFemboys");
  const ScuffedFemboys1 = await ScuffedFemboys.attach('0x6A4912083e8e7B6508D0568EB3eB40A8E681E121');

  {
    //console.log(merkleTree.toString());
    await ScuffedFemboys1.connect(deployer).setClaimRoot(await getRootFromClaimlistAndSave()); //rootHash
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
