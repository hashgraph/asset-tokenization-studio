// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "./ILoan.sol";
import { LOAN_MANAGER_ROLE } from "../../../constants/roles.sol";
import { LoanStorageWrapper } from "../../../domain/asset/loan/LoanStorageWrapper.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { SecurityStorageWrapper } from "../../../domain/asset/SecurityStorageWrapper.sol";

/**
 * @title Loan
 * @notice Abstract contract implementing loan lifecycle operations
 * @dev Provides loan creation, state management, interest accrual, and redemption
 * @author Hashgraph
 */
abstract contract Loan is ILoan, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Loan(
        LoanDetailsData calldata _loanDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    )
        external
        override
        onlyUninitialized(LoanStorageWrapper.isLoanInitialized())
        onlyValidTimestamp(_loanDetailsData.loanBasicData.startingDate)
        validateDates(_loanDetailsData.loanBasicData.startingDate, _loanDetailsData.loanBasicData.maturityDate)
    {
        LoanStorageWrapper.initializeLoan(_loanDetailsData);
        SecurityStorageWrapper.initializeSecurity(_regulationData, _additionalSecurityData);
    }

    function setLoanDetails(
        LoanDetailsData calldata loanDetailsData_
    )
        external
        override
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
