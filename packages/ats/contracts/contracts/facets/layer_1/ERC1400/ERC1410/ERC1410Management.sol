// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Management } from "./IERC1410Management.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { _ERC1410_MANAGEMENT_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ERC1410Management is IERC1410Management, Modifiers {
    function initializeERC1410(
        bool _multiPartition
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(_ERC1410_MANAGEMENT_RESOLVER_KEY) {
        ERC1410StorageWrapper.initialize_ERC1410(_multiPartition);
        InitializerStorageWrapper.setFacetToReady(_ERC1410_MANAGEMENT_RESOLVER_KEY);
        emit IERC1410Management.ERC1410Initialized(_multiPartition);
    }
}
