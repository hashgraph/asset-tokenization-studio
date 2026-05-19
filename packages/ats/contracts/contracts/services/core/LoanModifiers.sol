// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_LOAN_MANAGER, ROLE_LOANS_PORTFOLIO_MANAGER } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title LoanModifiers
 * @notice Abstract contract providing loan-related modifiers
 * @dev Provides modifiers for loan management role validation using _checkRole pattern
 *      from AccessControlStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract LoanModifiers {
    /**
     * @dev Modifier that validates msg.sender has ROLE_LOAN_MANAGER
     *
     * Requirements:
     * - msg.sender must have ROLE_LOAN_MANAGER
     */
    modifier onlyLoanManager() {
        AccessControlStorageWrapper.checkRole(ROLE_LOAN_MANAGER, EvmAccessors.getMsgSender());
        _;
    }

    /**
     * @dev Modifier that validates msg.sender has ROLE_LOANS_PORTFOLIO_MANAGER
     *
     * Requirements:
     * - msg.sender must have ROLE_LOANS_PORTFOLIO_MANAGER
     */
    modifier onlyLoansPortfolioManager() {
        AccessControlStorageWrapper.checkRole(ROLE_LOANS_PORTFOLIO_MANAGER, EvmAccessors.getMsgSender());
        _;
    }
}
