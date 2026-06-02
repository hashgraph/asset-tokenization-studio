// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondRead } from "../../layer_2/bond/BondRead.sol";
import { IBondRead } from "../../layer_2/bond/IBondRead.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title BondUSAReadFacetBase
 * @author Asset Tokenization Studio Team
 * @notice Shared read-side scaffold inherited by every concrete USA-bond read facet.
 *         Security regulation data is now handled exclusively by SecurityFacet.
 */
abstract contract BondUSAReadFacetBase is BondRead, IStaticFunctionSelectors, Modifiers {
    /// @inheritdoc IBondRead
    function initializeBondUSARead()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_bondReadInitializerKey())
    {
        InitializerStorageWrapper.setFacetToReady(_bondReadInitializerKey());
        emit BondUSAReadInitialized();
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeBondUSARead.selector, this.getBondDetails.selector);
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBondRead).interfaceId);
    }

    function _bondReadInitializerKey() internal view virtual returns (bytes32);
}
