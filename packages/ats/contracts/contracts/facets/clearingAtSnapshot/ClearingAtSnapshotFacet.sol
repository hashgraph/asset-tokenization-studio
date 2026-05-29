// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingAtSnapshot, RESOLVER_KEY_CLEARING_AT_SNAPSHOT } from "./IClearingAtSnapshot.sol";
import { ClearingAtSnapshot } from "./ClearingAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ClearingAtSnapshotFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the snapshotted aggregate cleared-balance query through the
 *         `IClearingAtSnapshot` interface, registered under `RESOLVER_KEY_CLEARING_AT_SNAPSHOT`.
 * @dev Inherits read logic from `ClearingAtSnapshot` and satisfies `IStaticFunctionSelectors` for
 *      Diamond proxy selector registration. Exposes one selector: `clearedBalanceOfAtSnapshot`.
 */
contract ClearingAtSnapshotFacet is ClearingAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CLEARING_AT_SNAPSHOT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(this.initializeClearingAtSnapshot.selector, this.clearedBalanceOfAtSnapshot.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IClearingAtSnapshot).interfaceId);
    }
}
