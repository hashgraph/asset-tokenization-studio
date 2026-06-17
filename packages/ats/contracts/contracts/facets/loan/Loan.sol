// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan, RESOLVER_KEY_LOAN } from "./ILoan.sol";
import { ROLE_LOAN_MANAGER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { LoanStorageWrapper } from "../../domain/asset/LoanStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title  Loan
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `ILoan`.
 * @dev    Delegates all storage reads and writes to `LoanStorageWrapper`. Access guards
 *         are enforced via `Modifiers`; date validation uses `onlyValidTimestamp` and
 *         `validateDates`.
 */
abstract contract Loan is ILoan, Modifiers {
    /// @inheritdoc ILoan
    function initializeLoan(
        LoanDetailsData calldata _loanDetailsData
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_LOAN)
        onlyValidTimestamp(_loanDetailsData.loanBasicData.startingDate)
        validateDates(_loanDetailsData.loanBasicData.startingDate, _loanDetailsData.loanBasicData.maturityDate)
    {
        LoanStorageWrapper.initializeLoan(_loanDetailsData);
        // TODO: [LOAN-INTEGRATION] Security data should be initialised through TreasuryToken/deployment layer.
        // SecurityStorageWrapper.initializeSecurity(_regulationData, _additionalSecurityData);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_LOAN);
        emit ILoan.LoanInitialized(_loanDetailsData);
    }

    /// @inheritdoc ILoan
    /// @dev Emits {LoanDetailsSet}.
    function setLoanDetails(
        LoanDetailsData calldata loanDetailsData_
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_LOAN_MANAGER)
        onlyValidTimestamp(loanDetailsData_.loanBasicData.startingDate)
        onlyValidTimestamp(loanDetailsData_.loanBasicData.maturityDate)
        onlyValidTimestamp(loanDetailsData_.loanBasicData.signingDate)
        onlyValidTimestamp(loanDetailsData_.loanInterestData.firstAccrualDate)
        validateDates(loanDetailsData_.loanBasicData.startingDate, loanDetailsData_.loanBasicData.maturityDate)
        validateAddressNotZero(loanDetailsData_.loanBasicData.originatorAccount)
        validateAddressNotZero(loanDetailsData_.loanBasicData.servicerAccount)
    {
        LoanStorageWrapper.setLoanDetails(loanDetailsData_);
        emit ILoan.LoanDetailsSet(loanDetailsData_);
    }

    /// @inheritdoc ILoan
    function getLoanDetails() external view override returns (LoanDetailsData memory loanDetailsData_) {
        return LoanStorageWrapper.getLoanDetails();
    }
}
