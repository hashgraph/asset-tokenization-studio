// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IRecovery } from "./IRecovery.sol";
import { Recovery } from "./Recovery.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _RECOVERY_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/// @title RecoveryFacet
/// @author Asset Tokenization Studio Team
/// @notice Diamond facet exposing lost-wallet recovery operations.
/// @dev Registers two selectors: recoveryAddress and isAddressRecovered.
///      All business logic is provided by the {Recovery} abstract contract.
contract RecoveryFacet is Recovery, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _RECOVERY_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.recoveryAddress.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isAddressRecovered.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IRecovery).interfaceId;
    }
}
