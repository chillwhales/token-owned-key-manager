import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers.js";
import {
  KeyManagerInternalTester,
  LSP6KeyManager,
  LSP6KeyManagerInit,
  UniversalProfile,
  UniversalProfileInit,
} from "../../types/index.js";

export type LSP6TestContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManager;
  initialFunding?: bigint;
};

export type LSP6TestInitContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile: UniversalProfileInit;
  keyManager: LSP6KeyManagerInit;
  initialFunding?: bigint;
};

export type LSP6InternalsTestContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManagerInternalTester: KeyManagerInternalTester;
};
