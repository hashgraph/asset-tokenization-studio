// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoreAtSnapshot } from "./ICoreAtSnapshot.sol";
import { CoreAtSnapshot } from "./CoreAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _CORE_AT_SNAPSHOT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CoreAtSnapshotFacet
 * @notice Diamond facet that exposes core token properties resolved against a snapshot identifier,
 *         registered under `_CORE_AT_SNAPSHOT_RESOLVER_KEY`.
 * @dev Inherits read logic from `CoreAtSnapshot` and satisfies `IStaticFunctionSelectors` for
 *      Diamond proxy selector registration. Exposes one selector: `decimalsAtSnapshot`.
 * @author Asset Tokenization Studio Team
 */
contract CoreAtSnapshotFacet is CoreAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CORE_AT_SNAPSHOT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.decimalsAtSnapshot.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ICoreAtSnapshot).interfaceId);
    }
}
