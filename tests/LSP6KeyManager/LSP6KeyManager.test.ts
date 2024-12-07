import { ethers } from "hardhat";

import {
  KeyManagerInternalTester__factory,
  UniversalProfile__factory,
  LSP6KeyManager__factory,
  LSP8Mintable__factory,
} from "../../types";

import { LSP6TestContext } from "../utils/context";

import {
  shouldInitializeLikeLSP6,
  shouldBehaveLikeLSP6,
  testLSP6InternalFunctions,
} from "./LSP6KeyManager.behaviour";
import { hexlify, randomBytes, toBeHex } from "ethers";
import {
  LSP4_TOKEN_TYPES,
  LSP8_TOKEN_ID_FORMAT,
} from "@lukso/lsp-smart-contracts";

describe("LSP6KeyManager with constructor", () => {
  const buildTestContext = async (
    initialFunding?: bigint
  ): Promise<LSP6TestContext> => {
    const accounts = await ethers.getSigners();
    const mainController = accounts[0];

    const universalProfile = await new UniversalProfile__factory(
      mainController
    ).deploy(mainController.address, {
      value: initialFunding,
    });

    const lsp8 = await new LSP8Mintable__factory(accounts[0]).deploy(
      "name",
      "symbol",
      accounts[0].address,
      LSP4_TOKEN_TYPES.COLLECTION,
      LSP8_TOKEN_ID_FORMAT.NUMBER
    );

    const keyManager = await new LSP6KeyManager__factory(mainController).deploy(
      universalProfile.target,
      lsp8.target,
      toBeHex(1, 32)
    );

    return {
      accounts,
      mainController,
      universalProfile,
      keyManager,
      initialFunding,
    };
  };

  describe("when deploying the contract", () => {
    describe("when initializing the contract", () => {
      shouldInitializeLikeLSP6(buildTestContext);
    });
  });

  describe("when testing deployed contract", () => {
    shouldBehaveLikeLSP6(buildTestContext);
  });

  describe("testing internal functions", () => {
    testLSP6InternalFunctions(async () => {
      const accounts = await ethers.getSigners();
      const mainController = accounts[0];

      const universalProfile = await new UniversalProfile__factory(
        mainController
      ).deploy(mainController.address);
      const lsp8 = await new LSP8Mintable__factory(accounts[0]).deploy(
        "name",
        "symbol",
        accounts[0].address,
        LSP4_TOKEN_TYPES.COLLECTION,
        LSP8_TOKEN_ID_FORMAT.NUMBER
      );

      const keyManagerInternalTester =
        await new KeyManagerInternalTester__factory(mainController).deploy(
          universalProfile.target,
          lsp8.target,
          toBeHex(1, 32)
        );

      return {
        mainController,
        accounts,
        universalProfile,
        keyManagerInternalTester,
      };
    });
  });
});
