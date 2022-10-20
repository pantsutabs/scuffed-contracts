const fs = require('fs').promises;
const { MerkleTree } = require("merkletreejs")
const keccak256 = require("keccak256")

async function main() {
    let addysStr = '';
    let preppedAddresToProof = {root:null, address:{}};

    addysStr = await fs.readFile("./claimlist.txt", "utf-8");

    // Test addys
    /* {
        addysStr = 
`0x16ce69f3fe7c52aa0fb25543a0ffd404bfddb8f2
0x1c8dd4c50ba22dda279f886dbf0bd3ee5b651526
0xde65e8c956c8a82eae92c056dd3c17a228048f17
0x5A2Eb500ddc1C142E93617833b59fA623072d601`;
    } */

    let addysArr = addysStr.split("\n");

    function arrayUnique(arr) {
        return arr.filter((v, i, a) => a.indexOf(v) === i);
    }

    function toLowerCase(arr) {
        let newArr = arr.map(function(e) { 
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
    }

    await fs.writeFile('./claimMerkleProofs.json', JSON.stringify(preppedAddresToProof), err => { 
        if (err) {
            console.error(err);
        }
        // file written successfully
    });
}

main();