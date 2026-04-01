// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "./ILoan.sol";
import { _LOAN_MANAGER_ROLE } from "../../../constants/roles.sol";
import { Internals } from "../../../domain/Internals.sol";
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";

abstract contract Loan is ILoan, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Loan(
        LoanDetailsData calldata _loanDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external override onlyUninitialized(_isLoanInitialized()) {
        _initializeLoanDetails(_loanDetailsData);
        _initializeSecurity(_regulationData, _additionalSecurityData);
    }

    function setLoanDetails(
        LoanDetailsData calldata loanDetailsData_
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOAN_MANAGER_ROLE)
        onlyValidTimestamp(loanDetailsData_.loanBasicData.startingDate)
        onlyValidTimestamp(loanDetailsData_.loanBasicData.maturityDate)
        onlyValidTimestamp(loanDetailsData_.loanBasicData.signingDate)
        onlyValidTimestamp(loanDetailsData_.loanInterestData.firstAccrualDate)
        validateDates(loanDetailsData_.loanBasicData.startingDate, loanDetailsData_.loanBasicData.maturityDate)
        validateAddress(loanDetailsData_.loanBasicData.originatorAccount)
        validateAddress(loanDetailsData_.loanBasicData.servicerAccount)
    {
        _storeLoanDetails(loanDetailsData_);
        emit LoanDetailsSet(loanDetailsData_);
    }

    function getLoanDetails() external view override returns (LoanDetailsData memory loanDetailsData_) {
        return _getLoanDetails();
    }
}
