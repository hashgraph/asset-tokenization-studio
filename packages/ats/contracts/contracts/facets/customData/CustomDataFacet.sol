// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICustomData, RESOLVER_KEY_CUSTOM_DATA } from "./ICustomData.sol";
import { CustomData } from "./CustomData.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title CustomDataFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the key/value custom data operations — set and get — as
 *         selectable proxy functions.
 * @dev Inherits `CustomData` for the business logic and implements `IStaticFunctionSelectors` for
 *      the Diamond resolver pattern. The resolver key `RESOLVER_KEY_CUSTOM_DATA` identifies this
 *      facet within the diamond proxy.
 */
contract CustomDataFacet is CustomData, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CUSTOM_DATA;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeCustomData.selector,
                this.getCustomData.selector,
                this.setCustomData.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ICustomData).interfaceId);
    }
}
