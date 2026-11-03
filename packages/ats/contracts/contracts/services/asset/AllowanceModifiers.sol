// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20StorageWrapper } from "../../domain/asset/ERC20StorageWrapper.sol";

/**
 * @title Allowance Modifiers
 * @notice Provides reusable modifiers for validating ERC20 allowance constraints.
 * @dev Delegates allowance validation to ERC20StorageWrapper before executing guarded logic.
 * @author Hashgraph
 */
abstract contract AllowanceModifiers {
    /**
     * @notice Restricts execution to spender allowances that are finite.
     * @dev Reverts through ERC20StorageWrapper if the allowance is not finite.
     * @param owner Account that grants the allowance.
     * @param spender Account whose allowance is validated.
     */
    modifier onlyFiniteAllowance(address owner, address spender) {
        ERC20StorageWrapper.checkFiniteAllowance(owner, spender);
        _;
    }
}
