const { expect } = require("chai");
const { waffle } = require("hardhat");
const hre = require("hardhat");

const {MerkleTree} = require("merkletreejs")
const keccak256 = require("keccak256")

describe("test everything", function() {
  	it("works probably as intended", async function() {
     	this.timeout(20000);
		const provider = waffle.provider;
		const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await hre.ethers.getSigners();
		const addrOwner = await owner.getAddress(); // deployer
		const addr1raw = await addr1.getAddress(); // sale receiver
		const addr2raw = await addr2.getAddress(); // put on claim list
		const addr3raw = await addr3.getAddress(); // put on claim list
		const addr4raw = await addr4.getAddress(); // put on claim list
		const addr5raw = await addr5.getAddress(); // normal buyer
		const addr6raw = await addr6.getAddress(); // normal buyer
		const ScuffedFemboys = await hre.ethers.getContractFactory("ScuffedFemboys");
		const ScuffedFemboys1 = await ScuffedFemboys.deploy("Scuffed Femboys", "SCUFFED", 3, 4, addr1raw);

		await ScuffedFemboys1.deployed();

		// Set up the merkle tree
		let addresses = [
			addr2raw,
			addr3raw,
			addr4raw
		];
		// Hash addresses to get the leaves
		let leaves = addresses.map(addr => keccak256(addr))
		// Create tree
		let merkleTree = new MerkleTree(leaves, keccak256, {sortPairs: true})
		// Get root
		let rootHash = merkleTree.getRoot();//.toString('hex')
		// Pretty-print tree
		console.log(merkleTree.toString());
		console.log("root:", rootHash);

		// (owner) set root
		await ScuffedFemboys1.connect(owner).setClaimRoot(rootHash);
		
		// (addr2) tries to mint when sale not started - fail
		{
			let address = addr2raw; // uses addr3's hashes for addr2
			let hashedAddress = keccak256(address);
			let proof = merkleTree.getHexProof(hashedAddress);
			await expect(ScuffedFemboys1.connect(addr2).claim(proof)).to.be.revertedWith('Mint has not started');
		}
		
		// (addr2) tries to buy when sale not started - fail
		{
			await expect(ScuffedFemboys1.connect(addr2).buy(0, {value: hre.ethers.utils.parseEther("0.05")})).to.be.revertedWith('Mint has not started');
		}

		// start sale
		await ScuffedFemboys1.connect(owner).setMintingStatus(true);

		// (addr2) mint a free pair with bad verification - fail
		{
			let address = addr3raw; // uses addr3's hashes for addr2
			let hashedAddress = keccak256(address);
			let proof = merkleTree.getHexProof(hashedAddress);
			await expect(ScuffedFemboys1.connect(addr2).claim(proof)).to.be.revertedWith('Incorrect proof');
		}

		// (addr2) mint a free pair with good verification - success
		{
			let address = addr2raw;
			let hashedAddress = keccak256(address);
			let proof = merkleTree.getHexProof(hashedAddress);
			await ScuffedFemboys1.connect(addr2).claim(proof);
		}

		// (addr2) try to repeat the previous - (already claimed) - fail
		{
			let address = addr2raw;
			let hashedAddress = keccak256(address);
			let proof = merkleTree.getHexProof(hashedAddress);
			await expect(ScuffedFemboys1.connect(addr2).claim(proof)).to.be.revertedWith('Claimed already');
		}

		// (addr3) mint a free pair with good verification - success
		{
			let address = addr3raw;
			let hashedAddress = keccak256(address);
			let proof = merkleTree.getHexProof(hashedAddress);
			await ScuffedFemboys1.connect(addr3).claim(proof);
		}

		// (addr4) mint a free pair with good verification - (no claims left total) - fail 
		{
			let address = addr4raw;
			let hashedAddress = keccak256(address);
			let proof = merkleTree.getHexProof(hashedAddress);
			await expect(ScuffedFemboys1.connect(addr4).claim(proof)).to.be.revertedWith('Not enough left to claim');
		}

		// (addr5) buy one - with no/less money - fail
		await expect(ScuffedFemboys1.connect(addr5).buy(1)).to.be.revertedWith('Wrong ETH sum sent');
		await expect(ScuffedFemboys1.connect(addr5).buy(1, {value: hre.ethers.utils.parseEther("0.00")})).to.be.revertedWith('Wrong ETH sum sent');
		await expect(ScuffedFemboys1.connect(addr5).buy(1, {value: hre.ethers.utils.parseEther("0.02")})).to.be.revertedWith('Wrong ETH sum sent');

		// (addr5) buy one - with more money - fail
		await expect(ScuffedFemboys1.connect(addr5).buy(1, {value: hre.ethers.utils.parseEther("0.06")})).to.be.revertedWith('Wrong ETH sum sent');
		await expect(ScuffedFemboys1.connect(addr5).buy(1, {value: hre.ethers.utils.parseEther("1.06")})).to.be.revertedWith('Wrong ETH sum sent');
		
		// (addr5) buy 0 or too many - fail
		await expect(ScuffedFemboys1.connect(addr5).buy(0, {value: hre.ethers.utils.parseEther("0.05")})).to.be.revertedWith('Cannot mint 0');
		await expect(ScuffedFemboys1.connect(addr5).buy(0, {value: hre.ethers.utils.parseEther("0.00")})).to.be.revertedWith('Cannot mint 0');
		await expect(ScuffedFemboys1.connect(addr5).buy(150, {value: hre.ethers.utils.parseEther("7.5")})).to.be.revertedWith('What are you doing');

		// (addr5) buy one - with accurate money - success
		await ScuffedFemboys1.connect(addr5).buy(1, {value: hre.ethers.utils.parseEther("0.05")});

		// (addr6) buy the remaining 2 together - success
		await ScuffedFemboys1.connect(addr6).buy(2, {value: hre.ethers.utils.parseEther("0.1")});

		// (addr5) buy one - with accurate money - (no mints left) - fail
		await expect(ScuffedFemboys1.connect(addr5).buy(1, {value: hre.ethers.utils.parseEther("0.05")})).to.be.revertedWith('Not enough left for sale');

		// (addr6) buy one - with accurate money - (no mints left) - fail
		await expect(ScuffedFemboys1.connect(addr6).buy(1, {value: hre.ethers.utils.parseEther("0.05")})).to.be.revertedWith('Not enough left for sale');

		// (addr2) buy one - with accurate money - (no mints left) - fail
		await expect(ScuffedFemboys1.connect(addr2).buy(1, {value: hre.ethers.utils.parseEther("0.05")})).to.be.revertedWith('Not enough left for sale');

		// (addr6) transfer id:5 to addr5 - success
		await ScuffedFemboys1.connect(addr6).transferFrom(addr6raw, addr5raw, 5);

		// (addr6) transfer id:5 to addr2 - (doesn't own) - fail
		await expect(ScuffedFemboys1.connect(addr6).transferFrom(addr6raw, addr2raw, 5)).to.be.revertedWith('ERC721: caller is not token owner nor approved');

		// (addr6) transfer id:3 to addr5 - (doesn't own) - fail
		await expect(ScuffedFemboys1.connect(addr6).transferFrom(addr6raw, addr5raw, 3)).to.be.revertedWith('ERC721: caller is not token owner nor approved');

		// check balances, addr2 - 2, addr3 - 2, addr4 - 0, addr5 - 2, addr6 - 1
		await expect(await ScuffedFemboys1.balanceOf(addr2raw)).to.equal(hre.ethers.BigNumber.from("2"));
		await expect(await ScuffedFemboys1.balanceOf(addr3raw)).to.equal(hre.ethers.BigNumber.from("2"));
		await expect(await ScuffedFemboys1.balanceOf(addr4raw)).to.equal(hre.ethers.BigNumber.from("0"));
		await expect(await ScuffedFemboys1.balanceOf(addr5raw)).to.equal(hre.ethers.BigNumber.from("2"));
		await expect(await ScuffedFemboys1.balanceOf(addr6raw)).to.equal(hre.ethers.BigNumber.from("1"));

		// Non owner tries to set restricted parameters
		await expect(ScuffedFemboys1.connect(addr3).setClaimRoot(rootHash)).to.be.revertedWith('Ownable: caller is not the owner');
		await expect(ScuffedFemboys1.connect(addr3).setBaseURI("ipfs://testtesttest/")).to.be.revertedWith('Ownable: caller is not the owner');

		// set URI
		await ScuffedFemboys1.connect(owner).setBaseURI("ipfs://testtesttest/");
		
		// check the get URI that it works
		await expect(await ScuffedFemboys1.connect(addr5).tokenURI(1)).to.equal("ipfs://testtesttest/1");

		// (addr5) call withdraw ETH
		await ScuffedFemboys1.connect(addr5).withdrawETH();

		// check that the eth is received into (addr1)
		expect(hre.ethers.utils.formatEther((await provider.getBalance(addr1raw)))).to.equal('10000.15');
  	});
});