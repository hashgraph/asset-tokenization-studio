// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _LOAN_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { ILoan } from "../../../facets/layer_2/loan/ILoan.sol";
import { BondStorageWrapper } from "../bond/BondStorageWrapper.sol";

abstract contract LoanStorageWrapper is BondStorageWrapper {
    struct LoanDataStorage {
        ILoan.LoanDetailsData loanDetail;
        bool initialized;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initializeLoanDetails(
        ILoan.LoanDetailsData calldata _loanDetailsData
    )
        internal
        override
        validateDates(_loanDetailsData.loanBasicData.startingDate, _loanDetailsData.loanBasicData.maturityDate)
        onlyValidTimestamp(_loanDetailsData.loanBasicData.startingDate)
    {
        LoanDataStorage storage ls = _loanStorage();
        ls.initialized = true;
        ls.loanDetail = _loanDetailsData;
    }

    function _storeLoanDetails(ILoan.LoanDetailsData memory _loanDetails) internal override {
        _loanStorage().loanDetail = _loanDetails;
    }

    function _getLoanDetails() internal view override returns (ILoan.LoanDetailsData memory loanDetails_) {
        loanDetails_ = _loanStorage().loanDetail;
    }

    function _isLoanInitialized() internal view override returns (bool) {
        return _loanStorage().initialized;
    }

    function _loanStorage() internal pure returns (LoanDataStorage storage loanData_) {
        bytes32 position = _LOAN_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            loanData_.slot := position
        }
    }
}
