// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ILoansPortfolioStorageWrapper
 * @notice Interface for loan and portfolio storage operations
 * @dev Defines storage layout, events, and custom errors for loan lifecycle
 * @author Hashgraph
 */
interface ILoansPortfolioStorageWrapper {
    struct LoanPortfolioData {
        uint256 totalLoans;
        uint256 activeLoans;
        uint256 totalValue;
        mapping(uint256 => bytes32) loanIds;
        mapping(bytes32 => uint256) loanIndex;
    }

    /**
     * @notice Emitted when a loan is added to the portfolio.
     * @param portfolioId The portfolio identifier.
     * @param loanId The unique loan identifier.
     * @param operator Address that performed the operation.
     * @param timestamp Timestamp when the loan was added.
     */
    event LoanAddedToPortfolio(
        bytes32 indexed portfolioId,
        bytes32 indexed loanId,
        address indexed operator,
        uint256 timestamp
    );

    /**
     * @notice Emitted when a loan is removed from the portfolio.
     * @param portfolioId The portfolio identifier.
     * @param loanId The unique loan identifier.
     * @param operator Address that performed the operation.
     */
    event LoanRemovedFromPortfolio(bytes32 indexed portfolioId, bytes32 indexed loanId, address indexed operator);

    /**
     * @notice Emitted when a loan is created.
     * @param loanId The unique loan identifier.
     * @param operator Address that created the loan.
     * @param timestamp Timestamp when the loan was created.
     */
    event LoanCreated(bytes32 indexed loanId, address indexed operator, uint256 timestamp);

    /**
     * @notice Emitted when a loan is cancelled.
     * @param loanId The unique loan identifier.
     * @param operator Address that performed the cancellation.
     */
    event LoanCancelled(bytes32 indexed loanId, address indexed operator);

    /**
     * @notice Loan creation failed due to an internal failure.
     */
    error LoanCreationFailed();

    /**
     * @notice Thrown when attempting to operate on a cancelled loan.
     * @param loanId The loan identifier.
     */
    error LoanNotActive(bytes32 loanId);

    /**
     * @notice Thrown when attempting to cancel a loan that still has active operations.
     * @param loanId The loan identifier.
     */
    error LoanHasActiveOperations(bytes32 loanId);

    /**
     * @notice Thrown when loan ID is not found.
     * @param loanId The loan identifier.
     */
    error LoanNotFound(bytes32 loanId);

    /**
     * @notice Thrown when attempting to add a duplicate loan to portfolio.
     * @param portfolioId The portfolio identifier.
     * @param loanId The loan identifier.
     */
    error LoanAlreadyInPortfolio(bytes32 portfolioId, bytes32 loanId);

    /**
     * @notice Thrown when attempting to remove a loan that is not in the portfolio.
     * @param portfolioId The portfolio identifier.
     * @param loanId The loan identifier.
     */
    error LoanNotInPortfolio(bytes32 portfolioId, bytes32 loanId);

    /**
     * @notice Thrown when loan state is invalid for the requested operation.
     * @param loanId The loan identifier.
     * @param currentState The current loan state.
     */
    error InvalidLoanState(bytes32 loanId, uint8 currentState);

    /**
     * @notice Thrown when state transition is not allowed.
     * @param loanId The loan identifier.
     * @param fromState The current state.
     * @param toState The target state.
     */
    error InvalidStateTransition(bytes32 loanId, uint8 fromState, uint8 toState);
}
