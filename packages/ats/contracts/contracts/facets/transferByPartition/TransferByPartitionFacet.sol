// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransferByPartition } from "./ITransferByPartition.sol";
import { TransferByPartition } from "./TransferByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _TRANSFER_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/// @title TransferByPartitionFacet
/// @author Asset Tokenization Studio Team
/// @notice Diamond facet exposing token-holder-initiated partition transfers.
/// @dev Registers one selector: transferByPartition.
///      All business logic is provided by the {TransferByPartition} abstract contract.
contract TransferByPartitionFacet is TransferByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _TRANSFER_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.transferByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ITransferByPartition).interfaceId;
    }
}
