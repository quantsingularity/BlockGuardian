const hre = require("hardhat");

async function main() {
  const initialGreeting = "Hello, BlockGuardian!";
  const ExampleContract = await hre.ethers.getContractFactory("ExampleContract");
  
  console.log("Deploying ExampleContract...");
  const exampleContract = await ExampleContract.deploy(initialGreeting);
  
  await exampleContract.waitForDeployment();

  const contractAddress = await exampleContract.getAddress();
  console.log(`ExampleContract deployed to: ${contractAddress}`);

  // You can add further interactions here, for example:
  // console.log(`Current greeting: ${await exampleContract.getGreeting()}`);
  // const newGreeting = "Hello, Hardhat!";
  // const tx = await exampleContract.setGreeting(newGreeting);
  // await tx.wait();
  // console.log(`Greeting changed to: ${await exampleContract.getGreeting()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

