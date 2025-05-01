const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const CraftLearnCredential = await hre.ethers.getContractFactory(
    "CraftLearnCredential"
  );

  // Deploy contracts
  const craftLearnCredential = await CraftLearnCredential.deploy();
  await craftLearnCredential.waitForDeployment();

  console.log(
    "CraftLearnCredential deployed to:",
    await craftLearnCredential.getAddress()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
