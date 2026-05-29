// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Permit, RESOLVER_KEY_ERC20PERMIT } from "./IERC20Permit.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ERC20PermitStorageWrapper } from "../../../../domain/asset/ERC20PermitStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title ERC20 Permit
 * @notice Provides ERC-20 permit support for approval by off-chain signature.
 * @dev This facet registers itself during initialisation and delegates permit state changes to
 *      `ERC20PermitStorageWrapper`. Permit execution is restricted to operational, activated,
 *      unpaused, compliant, single-partition assets.
 * @author Asset Tokenization Studio Team
 */
abstract contract ERC20Permit is IERC20Permit, Modifiers {
    /// @inheritdoc IERC20Permit
    function initializeERC20Permit()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_ERC20PERMIT)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_ERC20PERMIT);
        emit ERC20PermitInitialized();
    }

    /// @inheritdoc IERC20Permit
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        notZeroAddress(owner)
        notZeroAddress(spender)
        onlyCompliant(owner, spender, false)
        onlyWithoutMultiPartition
    {
        ERC20PermitStorageWrapper.permit(owner, spender, value, deadline, v, r, s);
    }
}
