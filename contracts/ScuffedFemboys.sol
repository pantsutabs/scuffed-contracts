//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract ScuffedFemboys is ERC721Enumerable, Ownable, ReentrancyGuard, ERC2981  {

    string public baseURI;

    // Mint params
    bool public mintStatus = false;

    address public saleReceiver; // sale receiver is also the royalty receiver
    uint256 public buyPrice = 0.05 ether;
    uint256 public maxScuffies4Sale;
    uint256 public scuffiesSold = 0;

    uint256 public maxScuffies4Claim;
    uint256 public scuffiesClaimed = 0;
    uint256 public scuffiesClaimCount = 2;
    bytes32 public claimRoot;
    mapping(address => bool) public claimedAddresses;

    constructor(string memory name_, string memory symbol_, uint256 maxSupplySale, uint256 maxSupplyClaim, address saleReceiver_) Ownable() ERC721(name_, symbol_) {
        maxScuffies4Sale = maxSupplySale;
        maxScuffies4Claim = maxSupplyClaim;
        saleReceiver = saleReceiver_;
        _setDefaultRoyalty(saleReceiver, 400); // 4%
    }

    modifier mintStarted() {
        require(mintStatus == true, "Mint has not started");
        _;
    }
    
    function setMintingStatus(bool mintStatus_) public onlyOwner {
        mintStatus = mintStatus_;
    }
    
    function setDefaultRoyalty(address saleReceiver_, uint96 feeNumerator) public onlyOwner {
        saleReceiver = saleReceiver_;
        _setDefaultRoyalty(saleReceiver, feeNumerator);
    }

    function setBaseURI(string memory newURI) public onlyOwner {
        baseURI = newURI;
    }

    // Overwrite
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
    
    function setClaimRoot(bytes32 newClaimRoot) public onlyOwner {
        claimRoot = newClaimRoot;
    }

    // Claim free pair
    function claim(bytes32[] calldata _merkleProof) external nonReentrant mintStarted {
        require(claimedAddresses[msg.sender] == false, "Claimed already");
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_merkleProof, claimRoot, leaf), "Incorrect proof");
        require(scuffiesClaimed + scuffiesClaimCount <= maxScuffies4Claim, "Not enough left to claim");

        scuffiesClaimed += scuffiesClaimCount;
        claimedAddresses[msg.sender] = true;

        uint supply = totalSupply();
        for (uint256 i = 0; i < scuffiesClaimCount; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    // Buy 1-100
    function buy(uint256 count) external nonReentrant mintStarted payable  {
        require(count > 0, "Cannot mint 0");
        require(count <= 100, "What are you doing");
        require(scuffiesSold + count <= maxScuffies4Sale, "Not enough left for sale");
        require(msg.value == count * buyPrice, "Wrong ETH sum sent");
        
        scuffiesSold += count;

        uint supply = totalSupply();
        for (uint256 i = 0; i < count; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function withdrawETH() external /* onlyOwner */ {
        payable(saleReceiver).transfer(address(this).balance);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}