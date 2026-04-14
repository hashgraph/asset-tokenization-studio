// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { Pagination } from "../../../infrastructure/utils/Pagination.sol";
import { _LOANS_PORTFOLIO_STORAGE_POSITION, _LOAN_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { ILoansPortfolioStorageWrapper } from "./ILoansPortfolioStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title LoansPortfolioStorageWrapper
 * @notice Library for loan and portfolio storage operations
 * @dev Provides read/write access to loan and portfolio data using EIP-1967 storage pattern
 * @author Hashgraph
 */
library LoansPortfolioStorageWrapper {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using Pagination for EnumerableSet.Bytes32Set;

    struct LoansPortfolioDataStorage {
        uint256 totalLoans;
        uint256 activeCount;
        uint256 totalValue;
        mapping(bytes32 => bool) activeLoans;
        mapping(bytes32 => uint256) loanToPortfolio;
        EnumerableSet.Bytes32Set portfolioLoanIds;
    }

    struct LoanDataStorage {
        bool active;
        bytes32 portfolioId;
        uint256 amount;
        uint256 interestRate;
        uint256 maturityDate;
        address borrower;
        uint256 createdAt;
    }

    function addLoanToPortfolio(bytes32 _portfolioId, bytes32 _loanId) internal returns (bool success_) {
        LoansPortfolioDataStorage storage s = _loansPortfolioStorage();

        if (s.activeLoans[_loanId]) {
            revert ILoansPortfolioStorageWrapper.LoanAlreadyInPortfolio(_portfolioId, _loanId);
        }

        s.portfolioLoanIds.add(_loanId);
        s.activeLoans[_loanId] = true;
        s.loanToPortfolio[_loanId] = s.totalLoans;
        s.totalLoans++;
        s.activeCount++;

        emit ILoansPortfolioStorageWrapper.LoanAddedToPortfolio(
            _portfolioId,
            _loanId,
            EvmAccessors.getMsgSender(),
            block.timestamp
        );

        success_ = true;
    }

    function removeLoanFromPortfolio(bytes32 _portfolioId, bytes32 _loanId) internal returns (bool success_) {
        LoansPortfolioDataStorage storage s = _loansPortfolioStorage();

        if (!s.activeLoans[_loanId]) {
            revert ILoansPortfolioStorageWrapper.LoanNotInPortfolio(_portfolioId, _loanId);
        }

        s.portfolioLoanIds.remove(_loanId);
        s.activeLoans[_loanId] = false;
        s.activeCount--;

        emit ILoansPortfolioStorageWrapper.LoanRemovedFromPortfolio(_portfolioId, _loanId, EvmAccessors.getMsgSender());

        success_ = true;
    }

    function createLoan(
        bytes32 _portfolioId,
        uint256 _amount,
        uint256 _interestRate,
        uint256 _maturityDate,
        address _borrower
    ) internal returns (bytes32 loanId_) {
        loanId_ = keccak256(abi.encodePacked(_portfolioId, _borrower, block.timestamp, EvmAccessors.getMsgSender()));

        LoanDataStorage storage loan = _loanStorage(loanId_);
        loan.active = true;
        loan.portfolioId = _portfolioId;
        loan.amount = _amount;
        loan.interestRate = _interestRate;
        loan.maturityDate = _maturityDate;
        loan.borrower = _borrower;
        loan.createdAt = block.timestamp;

        _loansPortfolioStorage().totalValue += _amount;

        emit ILoansPortfolioStorageWrapper.LoanCreated(loanId_, EvmAccessors.getMsgSender(), block.timestamp);

        addLoanToPortfolio(_portfolioId, loanId_);
    }

    function cancelLoan(bytes32 _loanId) internal returns (bool success_) {
        LoanDataStorage storage loan = _loanStorage(_loanId);

        if (!loan.active) {
            revert ILoansPortfolioStorageWrapper.LoanNotActive(_loanId);
        }

        loan.active = false;
        _loansPortfolioStorage().activeCount--;

        emit ILoansPortfolioStorageWrapper.LoanCancelled(_loanId, EvmAccessors.getMsgSender());

        success_ = true;
    }

    function getLoan(
        bytes32 _loanId
    )
        internal
        view
        returns (
            bool active_,
            bytes32 portfolioId_,
            uint256 amount_,
            uint256 interestRate_,
            uint256 maturityDate_,
            address borrower_,
            uint256 createdAt_
        )
    {
        LoanDataStorage storage loan = _loanStorage(_loanId);

        if (!loan.active && loan.createdAt == 0) {
            revert ILoansPortfolioStorageWrapper.LoanNotFound(_loanId);
        }

        active_ = loan.active;
        portfolioId_ = loan.portfolioId;
        amount_ = loan.amount;
        interestRate_ = loan.interestRate;
        maturityDate_ = loan.maturityDate;
        borrower_ = loan.borrower;
        createdAt_ = loan.createdAt;
    }

    function getPortfolioLoanCount() internal view returns (uint256) {
        return _loansPortfolioStorage().portfolioLoanIds.length();
    }

    function getPortfolioLoanIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory loanIds_) {
        return _loansPortfolioStorage().portfolioLoanIds.getFromSet(_pageIndex, _pageLength);
    }

    function getTotalPortfolioValue() internal view returns (uint256) {
        return _loansPortfolioStorage().totalValue;
    }

    function isLoanActive(bytes32 _loanId) internal view returns (bool) {
        return _loansPortfolioStorage().activeLoans[_loanId];
    }

    function _loansPortfolioStorage() private pure returns (LoansPortfolioDataStorage storage s_) {
        bytes32 position = _LOANS_PORTFOLIO_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            s_.slot := position
        }
    }

    function _loanStorage(bytes32 _loanId) private pure returns (LoanDataStorage storage loan_) {
        bytes32 position = keccak256(abi.encode(_LOAN_STORAGE_POSITION, _loanId));
        // solhint-disable-next-line no-inline-assembly
        assembly {
            loan_.slot := position
        }
    }
}
