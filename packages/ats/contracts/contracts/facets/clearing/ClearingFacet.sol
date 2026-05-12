// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearing } from "./IClearing.sol";
import { Clearing } from "./Clearing.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
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
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeClearing.selector,
                this.activateClearing.selector,
                this.deactivateClearing.selector,
                this.isClearingActivated.selector,
                this.getClearedAmountFor.selector,
                this.getClearingThirdParty.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IClearing).interfaceId);
    }
}
