// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondUSA } from "./IBondUSA.sol";
import { IBondTypes } from "../../layer_2/bond/IBondTypes.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";

abstract contract BondUSA is IBondUSA, Modifiers {
    /// @inheritdoc IBondUSA
    function initializeBondUSA(
        IBondTypes.BondDetailsData calldata _bondDetailsData
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(_bondInitializerKey()) {
        InitializerStorageWrapper.setFacetToReady(_bondInitializerKey());
        BondStorageWrapper.initialize_bond(_bondDetailsData);
        emit BondUSAInitialized();
    }

    function _bondInitializerKey() internal view virtual returns (bytes32);
}
