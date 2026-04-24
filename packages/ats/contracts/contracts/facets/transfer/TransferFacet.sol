// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ITransfer} from "./ITransfer.sol";
import { Transfer } from "./Transfer.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _TRANSFER_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title TransferFacet
 * @notice Diamond facet exposing ERC-20 and ERC-1594 token transfer operations.
 * @dev Registers four selectors: transfer, transferFrom, transferWithData, and
 *      transferFromWithData. Inherits all business logic from the Transfer abstract contract.
 */
contract TransferFacet is Transfer, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _TRANSFER_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 4;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.transferFromWithData.selector;
            staticFunctionSelectors_[--selectorIndex] = this.transferWithData.selector;
            staticFunctionSelectors_[--selectorIndex] = this.transferFrom.selector;
            staticFunctionSelectors_[--selectorIndex] = this.transfer.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ITransfer).interfaceId;
    }
}
