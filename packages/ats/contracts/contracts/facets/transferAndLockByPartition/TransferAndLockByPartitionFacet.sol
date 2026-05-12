// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransferAndLockByPartition } from "./ITransferAndLockByPartition.sol";
import { TransferAndLockByPartition } from "./TransferAndLockByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _TRANSFER_AND_LOCK_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  TransferAndLockByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the partition-aware transfer-and-lock
 *         operation via `ITransferAndLockByPartition`, registered under
 *         `_TRANSFER_AND_LOCK_BY_PARTITION_RESOLVER_KEY`.
 * @dev    Exposes 1 selector: `transferAndLockByPartition`. Inherits the
 *         implementation from `TransferAndLockByPartition` and satisfies
 *         `IStaticFunctionSelectors` for Diamond proxy selector registration.
 */
contract TransferAndLockByPartitionFacet is TransferAndLockByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _TRANSFER_AND_LOCK_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[0] = this.transferAndLockByPartition.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ITransferAndLockByPartition).interfaceId;
    }
}
