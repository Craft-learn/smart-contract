require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

module.exports = {
  solidity: "0.8.20",
  sourcify: {
    enabled: false,
  },
  networks: {
    "pharos-devnet": {
      url: `https://devnet.dplabs-internal.com`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
      chainId: 50002,
      gasPrice: 1000000000,
      gas: 8000000,
      httpOptions: {
        timeout: 60000,
      },
    },
  },
  etherscan: {
    apiKey: {
      "pharos-devnet": "empty",
    },
    customChains: [
      {
        network: "pharos-devnet",
        chainId: 50002,
        urls: {
          apiURL: "https://pharosscan.xyz/api",
          browserURL: "https://pharosscan.xyz",
        },
      },
    ],
  },
};