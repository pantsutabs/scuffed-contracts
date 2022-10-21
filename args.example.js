// an example of args file to verify contracts, also need an etherscan api key in your hardhat config, and require("@nomiclabs/hardhat-etherscan"); used there too
// npx hardhat verify --constructor-args args.js --network mainnet 0x16cE69F3fE7C52Aa0Fb25543a0fFD404bFDDb8f2 
module.exports = [
    ['0xf78A448E464a1fEB693D76c9211D2d03ae488206','0xeeDb59298bFea91fF721187CbB1F2D69F0FFa091'],
    [50,50],
    "etc",
    12,
    "etc"
  ];