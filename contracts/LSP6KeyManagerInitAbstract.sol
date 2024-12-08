// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {LSP6KeyManagerCore} from "./LSP6KeyManagerCore.sol";
import {
    InvalidLSP6Target,
    InvalidCollectionAddress,
    InvalidTokenId
} from "./LSP6Errors.sol";

/**
 * @title Proxy implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage. This is a custom implementation of LSP6KeyManager, it keeps all the properties of a normal LSP6KeyManager, additionally it allows setting a master token id that is the main contoller for the universal profile, the controller cannot be removed, its permissions cannot be altered. (Feature created by B00ste)
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev All the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
abstract contract LSP6KeyManagerInitAbstract is
    Initializable,
    LSP6KeyManagerCore
{
    function _initialize(
        address target_,
        address collection_,
        bytes32 tokenId_
    ) internal virtual onlyInitializing {
        if (target_ == address(0)) revert InvalidLSP6Target();
        if (collection_ == address(0)) revert InvalidCollectionAddress();
        if (tokenId_ == bytes32(0)) revert InvalidTokenId();

        _target = target_;
        _collection = collection_;
        _tokenId = tokenId_;
    }
}
