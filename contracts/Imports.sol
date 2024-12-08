// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

import {UniversalProfile} from "@lukso/universalprofile-contracts/contracts/UniversalProfile.sol";
import {UniversalProfileInit} from "@lukso/universalprofile-contracts/contracts/UniversalProfileInit.sol";
import {LSP0ERC725Account} from "@lukso/lsp0-contracts/contracts/LSP0ERC725Account.sol";
import {LSP1UniversalReceiverDelegateUP} from "@lukso/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateUP.sol";
import {LSP7Mintable} from "@lukso/lsp7-contracts/contracts/presets/LSP7Mintable.sol";
import {LSP7MintableInit} from "@lukso/lsp7-contracts/contracts/presets/LSP7MintableInit.sol";
import {LSP8Mintable} from "@lukso/lsp8-contracts/contracts/presets/LSP8Mintable.sol";
import {LSP23LinkedContractsFactory} from "@lukso/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol";