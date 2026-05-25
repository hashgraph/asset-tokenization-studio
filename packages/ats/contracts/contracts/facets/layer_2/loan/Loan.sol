// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "./ILoan.sol";
import { ROLE_LOAN_MANAGER } from "../../../constants/roles.sol";
import { LoanStorageWrapper } from "../../../domain/asset/LoanStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";

/**
 * @title Loan
 * @notice Abstract contract implementing loan lifecycle operations
 * @dev Provides loan creation, state management, interest accrual, and redemption
 * @author Hashgraph
 */
abstract contract Loan is ILoan, Modifiers {
    /// @inheritdoc ILoan
    function initializeLoan(
        LoanDetailsData calldata _loanDetailsData
    )
        external
        override
        onlyUninitialized(LoanStorageWrapper.isLoanInitialized())
        onlyValidTimestamp(_loanDetailsData.loanBasicData.startingDate)
        validateDates(_loanDetailsData.loanBasicData.startingDate, _loanDetailsData.loanBasicData.maturityDate)
    {
        LoanStorageWrapper.initializeLoan(_loanDetailsData);
    }

    /// @inheritdoc ILoan
    function setLoanDetails(
        LoanDetailsData calldata loanDetailsData_
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_LOAN_MANAGER)
        onlyValidTimestamp(loanDetailsData_.loanBasicData.startingDate)
        onlyValidTimestamp(loanDetailsData_.loanBasicData.maturityDate)
        onlyValidTimestamp(loanDetailsData_.loanBasicData.signingDate)
        onlyValidTimestamp(loanDetailsData_.loanInterestData.firstAccrualDate)
        validateDates(loanDetailsData_.loanBasicData.startingDate, loanDetailsData_.loanBasicData.maturityDate)
        notZeroAddress(loanDetailsData_.loanBasicData.originatorAccount)
        notZeroAddress(loanDetailsData_.loanBasicData.servicerAccount)
    {
        LoanStorageWrapper.setLoanDetails(loanDetailsData_);
    }

    /// @inheritdoc ILoan
    function getLoanDetails() external view override returns (LoanDetailsData memory loanDetailsData_) {
        return LoanStorageWrapper.getLoanDetails();
    }
}
