import { expect } from "chai";
import { ethers } from "hardhat";
import { LSP6TestContext, LSP6TestInitContext } from "../utils/context";
import {
  LSP6KeyManagerInit,
  LSP6KeyManagerInit__factory,
  LSP8Mintable__factory,
  UniversalProfileInit,
  UniversalProfileInit__factory,
} from "../../types";
import { deployProxy } from "../utils/fixtures";
import {
  shouldBehaveLikeLSP6,
  shouldInitializeLikeLSP6,
} from "./LSP6KeyManager.behaviour";
import { toBeHex } from "ethers";
import {
  LSP4_TOKEN_TYPES,
  LSP8_TOKEN_ID_FORMAT,
} from "@lukso/lsp-smart-contracts";

describe("LSP6KeyManager with proxy", () => {
  let context: LSP6TestInitContext;

  const buildProxyTestContext = async (
    initialFunding?: bigint
  ): Promise<LSP6TestInitContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const baseUP = await new UniversalProfileInit__factory(
      mainController
    ).deploy();
    const upProxy = await deployProxy(baseUP.target as string, mainController);
    const universalProfile = baseUP.attach(upProxy) as UniversalProfileInit;

    const baseKM = await new LSP6KeyManagerInit__factory(
      mainController
    ).deploy();
    const kmProxy = await deployProxy(
      await baseKM.getAddress(),
      mainController
    );
    const keyManager = baseKM.attach(kmProxy) as unknown as LSP6KeyManagerInit;

    return {
      accounts,
      mainController,
      universalProfile,
      keyManager,
      initialFunding,
    };
  };

  const initializeProxies = async (context: LSP6TestInitContext) => {
    await context.universalProfile.initialize(context.mainController.address, {
      value: context.initialFunding,
    });

    const lsp8 = await new LSP8Mintable__factory(context.accounts[0]).deploy(
      "name",
      "symbol",
      context.accounts[1],
      LSP4_TOKEN_TYPES.COLLECTION,
      LSP8_TOKEN_ID_FORMAT.NUMBER
    );

    await context.keyManager.initialize(
      await context.universalProfile.getAddress(),
      lsp8.target,
      toBeHex(1, 32)
    );

    return context;
  };

  describe("when deploying the base LSP6KeyManagerInit implementation", () => {
    it("`target()` of the base Key Manager contract MUST be `address(0)`", async () => {
      const accounts = await ethers.getSigners();
      const keyManagerBaseContract = await new LSP6KeyManagerInit__factory(
        accounts[0]
      ).deploy();

      const linkedTarget = await keyManagerBaseContract
        .getFunction("target")
        .call(null);
      expect(linkedTarget).to.equal(ethers.ZeroAddress);
    });

    it("should prevent any address from calling the `initialize(...)` function on the base contract", async () => {
      const context = await buildProxyTestContext();

      const baseKM = await new LSP6KeyManagerInit__factory(
        context.accounts[0]
      ).deploy();

      const lsp8 = await new LSP8Mintable__factory(context.accounts[0]).deploy(
        "name",
        "symbol",
        context.accounts[0].address,
        LSP4_TOKEN_TYPES.COLLECTION,
        LSP8_TOKEN_ID_FORMAT.NUMBER
      );

      await expect(
        baseKM.initialize(
          context.accounts[0].address,
          lsp8.target,
          toBeHex(1, 32)
        )
      ).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("when initializing the proxy", () => {
    shouldInitializeLikeLSP6(async () => {
      context = await buildProxyTestContext();
      await initializeProxies(context);
      return context;
    });
  });

  describe("when calling `initialize(...) more than once`", () => {
    it("should revert", async () => {
      context = await buildProxyTestContext();
      await initializeProxies(context);

      await expect(initializeProxies(context)).to.be.revertedWith(
        "Initializable: contract is already initialized"
      );
    });
  });

  describe("when testing the deployed proxy", () => {
    shouldBehaveLikeLSP6(async (initialFunding?: bigint) => {
      const context = await buildProxyTestContext(initialFunding);
      await initializeProxies(context);
      return context;
    });
  });
});
