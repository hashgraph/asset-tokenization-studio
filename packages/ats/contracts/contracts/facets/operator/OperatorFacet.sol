// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IOperator, RESOLVER_KEY_OPERATOR } from "./IOperator.sol";
import { Operator } from "./Operator.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title  OperatorFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes operator management operations as selectable proxy functions.
 * @dev Inherits `Operator` for the business logic and implements `IStaticFunctionSelectors` for
 *      the Diamond resolver pattern. The resolver key `RESOLVER_KEY_OPERATOR` identifies this
 *      facet within the diamond proxy.
 */
contract OperatorFacet is Operator, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_OPERATOR;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.isOperator.selector,
                this.authorizeOperator.selector,
                this.revokeOperator.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IOperator).interfaceId);
    }
}
