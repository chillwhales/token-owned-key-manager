import { expect } from "chai";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

import { LSP8Mintable__factory } from "../../types";

// setup
import { LSP6TestContext } from "../utils/context";
import { Addressable, concat, hexlify, randomBytes, toBeHex } from "ethers";
import { OPERATION_TYPES } from "@lukso/lsp0-contracts";
import { setupKeyManager } from "../utils/fixtures";
import { ALL_PERMISSIONS, ERC725YDataKeys } from "@lukso/lsp-smart-contracts";

export const testTokenOwnerMasterKey = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let masterTokenId: string,
    otherTokenId: string,
    upTokenIdOne: string,
    upTokenIdTwo: string,
    upTokenIdThree: string;

  let lsp8Owner: SignerWithAddress,
    masterTokenIdOwner: SignerWithAddress,
    otherTokenIdOwner: SignerWithAddress,
    anyOtherAccount: SignerWithAddress;

  let upSetDataParams: [string, string],
    upSetDataBatchParams: [string[], string[]],
    upExecuteParams: [number, Addressable, number, string],
    upExecuteBatchParams: [number[], Addressable[], number[], string[]];

  before("Preparing Token Owner Master Key tests", async () => {
    context = await buildContext();

    masterTokenId = await context.keyManager.tokenId();
    otherTokenId = hexlify(randomBytes(32));
    upTokenIdOne = hexlify(randomBytes(32));
    upTokenIdTwo = hexlify(randomBytes(32));
    upTokenIdThree = hexlify(randomBytes(32));

    lsp8Owner = context.accounts[1];
    masterTokenIdOwner = context.accounts[2];
    otherTokenIdOwner = context.accounts[3];
    anyOtherAccount = context.accounts[4];

    const lsp8 = LSP8Mintable__factory.connect(
      await context.keyManager.collection(),
      lsp8Owner
    );

    await lsp8
      .connect(lsp8Owner)
      .mint(masterTokenIdOwner, masterTokenId, true, "0x");
    await lsp8
      .connect(lsp8Owner)
      .mint(otherTokenIdOwner, otherTokenId, true, "0x");
    await lsp8
      .connect(lsp8Owner)
      .mint(context.universalProfile, upTokenIdOne, true, "0x");
    await lsp8
      .connect(lsp8Owner)
      .mint(context.universalProfile, upTokenIdTwo, true, "0x");
    await lsp8
      .connect(lsp8Owner)
      .mint(context.universalProfile, upTokenIdThree, true, "0x");

    upSetDataParams = [hexlify(randomBytes(32)), hexlify(randomBytes(60))];

    upSetDataBatchParams = [
      [hexlify(randomBytes(32)), hexlify(randomBytes(32))],
      [hexlify(randomBytes(60)), hexlify(randomBytes(60))],
    ];

    upExecuteParams = [
      OPERATION_TYPES.CALL,
      lsp8,
      0,
      lsp8.interface.encodeFunctionData("transfer", [
        await context.universalProfile.getAddress(),
        await anyOtherAccount.getAddress(),
        upTokenIdOne,
        true,
        "0x",
      ]),
    ];

    upExecuteBatchParams = [
      [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL],
      [lsp8, lsp8],
      [0, 0],
      [
        lsp8.interface.encodeFunctionData("transfer", [
          await context.universalProfile.getAddress(),
          await anyOtherAccount.getAddress(),
          upTokenIdTwo,
          true,
          "0x",
        ]),
        lsp8.interface.encodeFunctionData("transfer", [
          await context.universalProfile.getAddress(),
          await anyOtherAccount.getAddress(),
          upTokenIdThree,
          true,
          "0x",
        ]),
      ],
    ];

    await setupKeyManager(
      context,
      [
        concat([
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"],
          context.accounts[0].address,
        ]),
      ],
      [ALL_PERMISSIONS]
    );
  });

  describe("when testing if lsp8 owner can bypass permissions check", () => {
    it("should revert when calling `up.execute`", async () => {
      await expect(
        context.universalProfile.connect(lsp8Owner).execute(...upExecuteParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(lsp8Owner.address);
    });

    it("should revert when calling `up.execute`", async () => {
      await expect(
        context.universalProfile
          .connect(lsp8Owner)
          .executeBatch(...upExecuteBatchParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(lsp8Owner.address);
    });

    it("should revert when calling `up.setData`", async () => {
      await expect(
        context.universalProfile.connect(lsp8Owner).setData(...upSetDataParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(lsp8Owner.address);
    });

    it("should revert when calling `up.setDataBatch`", async () => {
      await expect(
        context.universalProfile
          .connect(lsp8Owner)
          .setDataBatch(...upSetDataBatchParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(lsp8Owner.address);
    });
  });

  describe("when testing if any other token id owner can bypass permissions check", () => {
    it("should revert when calling `up.execute`", async () => {
      await expect(
        context.universalProfile
          .connect(otherTokenIdOwner)
          .execute(...upExecuteParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(otherTokenIdOwner.address);
    });

    it("should revert when calling `up.execute`", async () => {
      await expect(
        context.universalProfile
          .connect(otherTokenIdOwner)
          .executeBatch(...upExecuteBatchParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(otherTokenIdOwner.address);
    });

    it("should revert when calling `up.setData`", async () => {
      await expect(
        context.universalProfile
          .connect(otherTokenIdOwner)
          .setData(...upSetDataParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(otherTokenIdOwner.address);
    });

    it("should revert when calling `up.setDataBatch`", async () => {
      await expect(
        context.universalProfile
          .connect(otherTokenIdOwner)
          .setDataBatch(...upSetDataBatchParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(otherTokenIdOwner.address);
    });
  });

  describe("when testing if any other caller can bypass permissions check", () => {
    it("should revert when calling `up.execute`", async () => {
      await expect(
        context.universalProfile
          .connect(anyOtherAccount)
          .execute(...upExecuteParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(anyOtherAccount.address);
    });

    it("should revert when calling `up.execute`", async () => {
      await expect(
        context.universalProfile
          .connect(anyOtherAccount)
          .executeBatch(...upExecuteBatchParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(anyOtherAccount.address);
    });

    it("should revert when calling `up.setData`", async () => {
      await expect(
        context.universalProfile
          .connect(anyOtherAccount)
          .setData(...upSetDataParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(anyOtherAccount.address);
    });

    it("should revert when calling `up.setDataBatch`", async () => {
      await expect(
        context.universalProfile
          .connect(anyOtherAccount)
          .setDataBatch(...upSetDataBatchParams)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(anyOtherAccount.address);
    });
  });

  describe("when testing if master token id owner can bypass permissions check", () => {
    it("should pass when calling `up.execute`", async () => {
      await expect(
        context.universalProfile
          .connect(masterTokenIdOwner)
          .execute(...upExecuteParams)
      ).to.not.be.reverted;
    });

    it("should pass when calling `up.execute`", async () => {
      await expect(
        context.universalProfile
          .connect(masterTokenIdOwner)
          .executeBatch(...upExecuteBatchParams)
      ).to.not.be.reverted;
    });

    it("should pass when calling `up.setData`", async () => {
      await expect(
        context.universalProfile
          .connect(masterTokenIdOwner)
          .setData(...upSetDataParams)
      ).to.not.be.reverted;
    });

    it("should pass when calling `up.setDataBatch`", async () => {
      await expect(
        context.universalProfile
          .connect(masterTokenIdOwner)
          .setDataBatch(...upSetDataBatchParams)
      ).to.not.be.reverted;
    });
  });
};
