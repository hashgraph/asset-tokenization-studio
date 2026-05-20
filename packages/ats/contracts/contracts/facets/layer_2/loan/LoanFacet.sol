// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "./ILoan.sol";
import { _LOAN_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";
import { Loan } from "./Loan.sol";

/**
 * @title LoanFacet
 * @notice Facet for loan lifecycle operations
 * @dev Concrete facet exposing loan creation, state management, and redemption
 * @author Hashgraph
 */
contract LoanFacet is Loan, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _LOAN_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeLoan.selector,
                this.setLoanDetails.selector,
                this.getLoanDetails.selector
            );
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ILoan).interfaceId);
    }
}
