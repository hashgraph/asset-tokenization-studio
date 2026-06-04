// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IRecovery, RESOLVER_KEY_RECOVERY } from "./IRecovery.sol";
import { Recovery } from "./Recovery.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/// @title RecoveryFacet
/// @author Asset Tokenization Studio Team
/// @notice Diamond facet exposing lost-wallet recovery operations.
/// @dev Registers two selectors: recoveryAddress and isAddressRecovered.
///      All business logic is provided by the {Recovery} abstract contract.
contract RecoveryFacet is Recovery, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_RECOVERY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeRecovery.selector,
                this.isAddressRecovered.selector,
                this.recoveryAddress.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IRecovery).interfaceId);
    }
}
