// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "../../../facets/layer_2/loan/ILoan.sol";

interface ILoanStorageWrapper {
    struct LoanDataStorage {
        ILoan.LoanDetailsData loanDetail;
        bool initialized;
    }
}
