// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperatorByPartition } from "./IOperatorByPartition.sol";
import { OperatorByPartition } from "./OperatorByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _OPERATOR_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  OperatorByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes per-partition operator management via
 *         `IOperatorByPartition`, registered under `_OPERATOR_BY_PARTITION_RESOLVER_KEY`.
 * @dev    Exposes five selectors:
 *           - `authorizeOperatorByPartition`
 *           - `revokeOperatorByPartition`
 *           - `isOperatorForPartition`
 *           - `operatorTransferByPartition`
 *           - `operatorRedeemByPartition`
 */
contract OperatorByPartitionFacet is OperatorByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _OPERATOR_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.authorizeOperatorByPartition.selector,
                this.revokeOperatorByPartition.selector,
                this.isOperatorForPartition.selector,
                this.operatorTransferByPartition.selector,
                this.operatorRedeemByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IOperatorByPartition).interfaceId);
    }
}
