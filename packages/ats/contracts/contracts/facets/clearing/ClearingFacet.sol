// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearing } from "./IClearing.sol";
import { Clearing } from "./Clearing.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CLEARING_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ClearingFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the clearing module global state and account-level reads.
 * @dev Registers six selectors under `_CLEARING_RESOLVER_KEY`: `initializeClearing`,
 *      `activateClearing`, `deactivateClearing`, `isClearingActivated`, `getClearedAmountFor`,
 *      and `getClearingThirdParty`. Inherits the implementation from `Clearing`. Requires
 *      `ClearingReadOps` library linking at deployment.
 */
contract ClearingFacet is Clearing, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 6;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getClearingThirdParty.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getClearedAmountFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isClearingActivated.selector;
            staticFunctionSelectors_[--selectorIndex] = this.deactivateClearing.selector;
            staticFunctionSelectors_[--selectorIndex] = this.activateClearing.selector;
            staticFunctionSelectors_[--selectorIndex] = this.initializeClearing.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IClearing).interfaceId;
        }
    }
}
