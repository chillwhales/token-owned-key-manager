import { ethers, getNamedAccounts } from "hardhat";
import {
  ILSP23LinkedContractsFactory,
  LSP23LinkedContractsFactory__factory,
  LSP6KeyManagerInit__factory,
  UniversalProfileInit__factory,
} from "../types";

import ERC725 from "@erc725/erc725.js";
import LSP1UniversalReceiverDelegateSchemas from "@erc725/erc725.js/schemas/LSP1UniversalReceiverDelegate.json";
import LSP3ProfileMetadataSchemas from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";
import LSP6KeyManagerSchemas from "@erc725/erc725.js/schemas/LSP6KeyManager.json";
import { AbiCoder, hexlify, randomBytes } from "ethers";

const abiCoder = new AbiCoder();

// ------ CONSTANTS (do not change) ------

const LSP23_ADDRESS = "0x2300000A84D25dF63081feAa37ba6b62C4c89a30";
const LSP23_POST_DEPLOYMENT_MODULE =
  "0x000000000066093407b6704B89793beFfD0D8F00";
const UNIVERSAL_PROFILE_IMPLEMENTATION_ADDRESS =
  "0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F";
const KEY_MANAGER_IMPLEMENTATION_ADDRESS =
  "0x30514044Ee75a510Bf6254eb09014A31c3394Fd9";
const UNIVERSAL_RECEIVER_ADDRESS = "0x7870C5B8BC9572A8001C3f96f7ff59961B23500D";

// ---------------------------------------

// ------ DEPLOYMENT SETTINGS (do change) ------

const MAIN_CONTROLLER = hexlify(randomBytes(20));
const COLLECTION_ADDRESS = "0x86e817172b5c07f7036bf8aa46e2db9063743a83";
const MASTER_KEY_TOKEN_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

// ---------------------------------------------

const deployLinkedContracts = async (
  salt: string,
  collectionAddress: string,
  tokenId: string,
  dataKeys: string[],
  dataValues: string[]
) => {
  const { deployer: deployerAddress } = await getNamedAccounts();
  const deployer = await ethers.getSigner(deployerAddress);

  const lsp23 = LSP23LinkedContractsFactory__factory.connect(
    LSP23_ADDRESS,
    deployer
  );

  const universalProfileInitStruct: ILSP23LinkedContractsFactory.PrimaryContractDeploymentInitStruct =
    {
      salt,
      fundingAmount: 0,
      implementationContract: UNIVERSAL_PROFILE_IMPLEMENTATION_ADDRESS,
      initializationCalldata:
        UniversalProfileInit__factory.createInterface().encodeFunctionData(
          "initialize",
          [LSP23_POST_DEPLOYMENT_MODULE]
        ),
    };

  const keyManagerInitStruct: ILSP23LinkedContractsFactory.SecondaryContractDeploymentInitStruct =
    {
      fundingAmount: 0,
      implementationContract: KEY_MANAGER_IMPLEMENTATION_ADDRESS,
      addPrimaryContractAddress: true,
      initializationCalldata:
        LSP6KeyManagerInit__factory.createInterface().getFunction("initialize")
          .selector,
      extraInitializationParams: abiCoder.encode(
        ["address", "bytes32"],
        [collectionAddress, tokenId]
      ),
    };

  const erc725 = new ERC725([
    ...LSP6KeyManagerSchemas,
    ...LSP3ProfileMetadataSchemas,
    ...LSP1UniversalReceiverDelegateSchemas,
  ]);

  const initializeEncodedBytes = abiCoder.encode(
    ["bytes32[]", "bytes[]"],
    [dataKeys, dataValues]
  );

  const [upAddress, keyManagerAddress] = await lsp23
    .connect(deployer)
    .deployERC1167Proxies.staticCall(
      universalProfileInitStruct,
      keyManagerInitStruct,
      LSP23_POST_DEPLOYMENT_MODULE,
      initializeEncodedBytes
    );

  console.log("Universal Profile address:", upAddress);
  console.log("Key Manager address:", keyManagerAddress);

  const tx = await lsp23
    .connect(deployer)
    .deployERC1167Proxies(
      universalProfileInitStruct,
      keyManagerInitStruct,
      LSP23_POST_DEPLOYMENT_MODULE,
      initializeEncodedBytes
    );
  await tx.wait(1);

  return { upAddress, keyManagerAddress };
};

const main = async () => {
  const salt = hexlify(randomBytes(32));

  const erc725 = new ERC725([
    ...LSP6KeyManagerSchemas,
    ...LSP3ProfileMetadataSchemas,
    ...LSP1UniversalReceiverDelegateSchemas,
  ]);

  const lsp3DataValue = {
    verification: {
      method: "keccak256(utf8)",
      data: "0x6d6d08aafb0ee059e3e4b6b3528a5be37308a5d4f4d19657d26dd8a5ae799de0",
    },
    // this is an IPFS CID of a LSP3 Profile Metadata example, you can use your own
    url: "ipfs://QmPRoJsaYcNqQiUrQxE7ajTRaXwHyAU29tHqYNctBmK64w",
  };

  const setDataKeysAndValues = erc725.encodeData([
    { keyName: "LSP3Profile", value: lsp3DataValue }, // LSP3Metadata data key and value
    {
      keyName: "LSP1UniversalReceiverDelegate",
      value: UNIVERSAL_RECEIVER_ADDRESS,
    }, // Universal Receiver data key and value
    {
      keyName: "AddressPermissions:Permissions:<address>",
      dynamicKeyParts: [UNIVERSAL_RECEIVER_ADDRESS],
      value: erc725.encodePermissions({
        REENTRANCY: true,
        SUPER_SETDATA: true,
      }),
    }, // Universal Receiver Delegate permissions data key and value
    {
      keyName: "AddressPermissions:Permissions:<address>",
      dynamicKeyParts: [MAIN_CONTROLLER],
      value: erc725.encodePermissions({
        CHANGEOWNER: true,
        ADDCONTROLLER: true,
        EDITPERMISSIONS: true,
        ADDEXTENSIONS: true,
        CHANGEEXTENSIONS: true,
        ADDUNIVERSALRECEIVERDELEGATE: true,
        CHANGEUNIVERSALRECEIVERDELEGATE: true,
        REENTRANCY: false,
        SUPER_TRANSFERVALUE: true,
        TRANSFERVALUE: true,
        SUPER_CALL: true,
        CALL: true,
        SUPER_STATICCALL: true,
        STATICCALL: true,
        SUPER_DELEGATECALL: false,
        DELEGATECALL: false,
        DEPLOY: true,
        SUPER_SETDATA: true,
        SETDATA: true,
        ENCRYPT: true,
        DECRYPT: true,
        SIGN: true,
        EXECUTE_RELAY_CALL: true,
      }), // Main Controller permissions data key and value
    },
    // Address Permissions array length = 2, and the controller addresses at each index
    {
      keyName: "AddressPermissions[]",
      value: [UNIVERSAL_RECEIVER_ADDRESS, MAIN_CONTROLLER],
    },
  ]);

  await deployLinkedContracts(
    salt,
    COLLECTION_ADDRESS,
    MASTER_KEY_TOKEN_ID,
    setDataKeysAndValues.keys,
    setDataKeysAndValues.values
  );
};

main();
