// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DiamondCutV1 } from "./DiamondCutV1.sol";
import { DiamondLoupeV1 } from "./DiamondLoupeV1.sol";
import { IDiamondFacetV1 } from "./IDiamondFacetV1.sol";
import { RESOLVER_KEY_DIAMOND } from "../IDiamondV1.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { InitializerModifiers } from "../../../../services/core/InitializerModifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";

/**
 * @title DiamondBase
 * @author Asset Tokenization Studio Team
 * @notice Abstract base for the Diamond facet that combines DiamondCut + DiamondLoupe
 *         with initialisation support via `initializeDiamondCut`.
 * @dev Inherits from existing DiamondCut and DiamondLoupe abstracts and adds the
 *      initialiser function that registers the facet with the centralised
 *      InitializerStorageWrapper.
 */
abstract contract DiamondBaseV1 is IDiamondFacetV1, DiamondCutV1, DiamondLoupeV1, InitializerModifiers {
    /// @inheritdoc IDiamondFacetV1
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
