import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { SALT } from "./constants";

const deployContract: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("LSP6KeyManagerInit", {
    from: deployer,
    log: true,
    deterministicDeployment: SALT,
  });
};

export default deployContract;
deployContract.tags = ["CustomKeyManager", "base"];
