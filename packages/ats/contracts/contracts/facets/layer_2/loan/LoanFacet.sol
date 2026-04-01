// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "./ILoan.sol";
import { Loan } from "./Loan.sol";
import { _LOAN_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Common } from "../../../domain/Common.sol";

contract LoanFacet is Loan, IStaticFunctionSelectors, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _LOAN_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_Loan.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setLoanDetails.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLoanDetails.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ILoan).interfaceId;
    }
}
