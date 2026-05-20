// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "./ILoan.sol";
import { LOAN_MANAGER_ROLE, DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { _LOAN_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { LoanStorageWrapper } from "../../../domain/asset/loan/LoanStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Loan
 * @notice Abstract contract implementing loan lifecycle operations
 * @dev Provides loan creation, state management, interest accrual, and redemption
 * @author Hashgraph
 */
abstract contract Loan is ILoan, Modifiers {
    function initializeLoan(
        LoanDetailsData calldata _loanDetailsData
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_LOAN_RESOLVER_KEY)
        onlyValidTimestamp(_loanDetailsData.loanBasicData.startingDate)
        validateDates(_loanDetailsData.loanBasicData.startingDate, _loanDetailsData.loanBasicData.maturityDate)
    {
        LoanStorageWrapper.initializeLoan(_loanDetailsData);
        // TODO: [LOAN-INTEGRATION] Security data should be initialised through TreasuryToken/deployment layer.
        // SecurityStorageWrapper.initializeSecurity(_regulationData, _additionalSecurityData);
        InitializerStorageWrapper.setFacetToReady(_LOAN_RESOLVER_KEY);
        emit ILoan.LoanInitialized(_loanDetailsData);
    }

    function setLoanDetails(
        LoanDetailsData calldata loanDetailsData_
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(LOAN_MANAGER_ROLE)
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

    function getLoanDetails() external view override returns (LoanDetailsData memory loanDetailsData_) {
        return LoanStorageWrapper.getLoanDetails();
    }
}
