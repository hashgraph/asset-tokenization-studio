// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _LOAN_MANAGER_ROLE, _LOANS_PORTFOLIO_MANAGER_ROLE } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title LoanModifiers
 * @notice Abstract contract providing loan-related modifiers
 * @dev Provides modifiers for loan management role validation using _checkRole pattern
 *      from AccessControlStorageWrapper
 * @author Hashgraph
 */
abstract contract LoanModifiers {
    /**
     * @dev Modifier that validates msg.sender has LOAN_MANAGER_ROLE
     *
     * Requirements:
     * - msg.sender must have _LOAN_MANAGER_ROLE
     */
    modifier onlyLoanManager() {
        AccessControlStorageWrapper.checkRole(_LOAN_MANAGER_ROLE, EvmAccessors.getMsgSender());
        _;
    }

    /**
     * @dev Modifier that validates msg.sender has LOANS_PORTFOLIO_MANAGER_ROLE
     *
     * Requirements:
     * - msg.sender must have _LOANS_PORTFOLIO_MANAGER_ROLE
     */
    modifier onlyLoansPortfolioManager() {
        AccessControlStorageWrapper.checkRole(_LOANS_PORTFOLIO_MANAGER_ROLE, EvmAccessors.getMsgSender());
        _;
    }
}
