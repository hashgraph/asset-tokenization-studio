// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransferByPartition, RESOLVER_KEY_TRANSFER_BY_PARTITION } from "./ITransferByPartition.sol";
import { TransferByPartition } from "./TransferByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/// @title TransferByPartitionFacet
/// @author Asset Tokenization Studio Team
/// @notice Diamond facet exposing token-holder-initiated partition transfers.
/// @dev Registers one selector: transferByPartition.
///      All business logic is provided by the {TransferByPartition} abstract contract.
contract TransferByPartitionFacet is TransferByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_TRANSFER_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.transferByPartition.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ITransferByPartition).interfaceId);
    }
}
