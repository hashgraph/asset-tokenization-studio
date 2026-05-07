// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshotsByPartition } from "./ISnapshotsByPartition.sol";
import { SnapshotsByPartition } from "./SnapshotsByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _SNAPSHOTS_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/// @title SnapshotsByPartitionFacet
/// @author Asset Tokenization Studio Team
/// @notice Diamond facet exposing the partition-level snapshot query surface.
/// @dev Registers one selector: partitionsOfAtSnapshot.
///      All business logic is provided by the {SnapshotsByPartition} abstract contract.
contract SnapshotsByPartitionFacet is SnapshotsByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SNAPSHOTS_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.partitionsOfAtSnapshot.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ISnapshotsByPartition).interfaceId;
    }
}
