// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DiamondCut } from "./DiamondCut.sol";
import { DiamondLoupe } from "./DiamondLoupe.sol";
import { IDiamondFacet } from "./IDiamondFacet.sol";
import { RESOLVER_KEY_DIAMOND } from "../proxy/IDiamond.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { InitializerModifiers } from "../../services/core/InitializerModifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";

/**
 * @title DiamondBase
 * @notice Abstract base for the Diamond facet that combines DiamondCut + DiamondLoupe
 *         with initialisation support via `initializeDiamondCut`.
 * @dev Inherits from existing DiamondCut and DiamondLoupe abstracts and adds the
 *      initialiser function that registers the facet with the centralised
 *      InitializerStorageWrapper.
 */
abstract contract DiamondBase is IDiamondFacet, DiamondCut, DiamondLoupe, InitializerModifiers {
    /// @inheritdoc IDiamondFacet
    function initializeDiamondCut()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_DIAMOND)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_DIAMOND);
        emit DiamondCutInitialized();
    }
}
