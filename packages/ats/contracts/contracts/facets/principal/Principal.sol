// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPrincipal } from "./IPrincipal.sol";
import { BondStorageWrapper } from "../../domain/asset/BondStorageWrapper.sol";

/**
 * @title Principal
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IPrincipal`, providing principal queries for bond tokens.
 * @dev Stateless wrapper that delegates the actual computation to {BondStorageWrapper}.
 *      Intended to be inherited by `PrincipalFacet`.
 */
abstract contract Principal is IPrincipal {
    /// @inheritdoc IPrincipal
    function getPrincipalFor(address _account) external view override returns (PrincipalFor memory principalFor_) {
        return BondStorageWrapper.getPrincipalFor(_account);
    }
}
