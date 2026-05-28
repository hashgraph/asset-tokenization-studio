// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquityUSA, RESOLVER_KEY_EQUITY } from "./IEquityUSA.sol";
import { Equity } from "../../layer_2/equity/Equity.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title EquityUSA
 * @notice Adds United States equity initialisation support to the base equity facet.
 * @dev Implements `IEquityUSA` and delegates equity state initialisation to `Equity`.
 *      The facet can be initialised once, requires an operational token, and restricts
 *      execution to accounts holding `DEFAULT_ADMIN_ROLE`.
 * @author Asset Tokenization Studio Team
 */
abstract contract EquityUSA is IEquityUSA, Equity {
    /// @inheritdoc IEquityUSA
    function initializeEquityUSA(
        EquityDetailsData calldata _equityDetailsData
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_EQUITY) {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_EQUITY);
        _initializeEquity(_equityDetailsData);
        emit EquityUSAInitialized();
    }
}
