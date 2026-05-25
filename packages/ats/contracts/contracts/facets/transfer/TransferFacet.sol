// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransfer, RESOLVER_KEY_TRANSFER } from "./ITransfer.sol";
import { Transfer } from "./Transfer.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title TransferFacet
 * @notice Diamond facet exposing ERC-20 and ERC-1594 token transfer operations.
 * @dev Registers four selectors: transfer, transferFrom, transferWithData, and
 *      transferFromWithData. Inherits all business logic from the Transfer abstract contract.
 */
contract TransferFacet is Transfer, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_TRANSFER;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.transfer.selector,
                this.transferFrom.selector,
                this.transferWithData.selector,
                this.transferFromWithData.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ITransfer).interfaceId);
    }
}
