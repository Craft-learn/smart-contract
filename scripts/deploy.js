const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const SoulboundCredential = await hre.ethers.getContractFactory(
    "SoulboundCredential"
  );

  // Deploy contracts
  const soulboundCredential = await SoulboundCredential.deploy({
    gasLimit: 8000000,
    gasPrice: ethers.parseUnits("1", "gwei"),
  });
  await soulboundCredential.waitForDeployment();

  console.log(
    "SoulboundCredential deployed to:",
    await soulboundCredential.getAddress()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
