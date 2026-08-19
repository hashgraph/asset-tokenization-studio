// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "../../facets/loan/ILoan.sol";
import { ITransferByPartition } from "../../facets/transferByPartition/ITransferByPartition.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title MockLoanHolding
 * @notice Configurable test stand-in for a loan holding asset read by `LoansPortfolio`.
 * @dev Exposes the two call surfaces the portfolio invokes: `getLoanDetails()`
 *      and `balanceOfByPartition(...)`. Only fields read by the portfolio are
 *      configurable; all other struct members return type defaults.
 * @author Asset Tokenization Studio Team
 */
contract MockLoanHolding is ITransferByPartition {
    /**
     * @notice Total collateral backing the mock loan holding.
     * @dev Populated in the `LoanDetailsData` struct returned by `getLoanDetails()`.
     */
    uint256 internal _totalCollateralValue;

    /**
     * @notice Repayment performance status of the mock loan.
     * @dev Populated in the `LoanPerformanceStatus` sub-struct within `getLoanDetails()`.
     */
    ILoan.PerformanceStatus internal _performanceStatus;

    /**
     * @notice Internal mapping storing token balances per partition and holder address.
     * @dev Looked up by `balanceOfByPartition` and updated during `setBalance` or
     *      `transferByPartition`.
     */
    mapping(bytes32 partition => mapping(address holder => uint256)) internal _balances;

    /**
     * @notice Flag determining whether `getLoanDetails()` reverts upon invocation.
     * @dev When `true`, calls to `getLoanDetails()` revert with `MockLoanDetailsRevert()`.
     */
    bool internal _revertOnGetLoanDetails;

    /**
     * @notice Flag determining whether `balanceOfByPartition(...)` reverts upon invocation.
     * @dev When `true`, calls to `balanceOfByPartition(...)` revert with
     *      `MockBalanceOfByPartitionRevert()`.
     */
    bool internal _revertOnBalanceOfByPartition;

    /**
     * @notice Thrown when `getLoanDetails` is configured to simulate an execution revert.
     * @dev Triggered when `_revertOnGetLoanDetails` is set to `true`.
     */
    error MockLoanDetailsRevert();

    /**
     * @notice Thrown when `balanceOfByPartition` is configured to simulate an execution revert.
     * @dev Triggered when `_revertOnBalanceOfByPartition` is set to `true`.
     */
    error MockBalanceOfByPartitionRevert();

    /**
     * @notice Configures whether calls to `getLoanDetails()` should revert.
     * @dev Sets the internal `_revertOnGetLoanDetails` flag.
     * @param _revert True to cause `getLoanDetails()` to revert with `MockLoanDetailsRevert`.
     */
    function setRevertOnGetLoanDetails(bool _revert) external {
        _revertOnGetLoanDetails = _revert;
    }

    /**
     * @notice Configures whether calls to `balanceOfByPartition(...)` should revert.
     * @dev Sets the internal `_revertOnBalanceOfByPartition` flag.
     * @param _revert True to cause `balanceOfByPartition(...)` to revert with
     *                `MockBalanceOfByPartitionRevert`.
     */
    function setRevertOnBalanceOfByPartition(bool _revert) external {
        _revertOnBalanceOfByPartition = _revert;
    }

    /**
     * @notice Sets the collateral value and repayment performance classification.
     * @dev Updates internal state variables returned in `LoanDetailsData` by `getLoanDetails()`.
     * @param _newTotalCollateralValue Total collateral value backing the loan.
     * @param _newPerformanceStatus Current repayment performance status.
     */
    function setLoanState(uint256 _newTotalCollateralValue, ILoan.PerformanceStatus _newPerformanceStatus) external {
        _totalCollateralValue = _newTotalCollateralValue;
        _performanceStatus = _newPerformanceStatus;
    }

    /**
     * @notice Sets the token balance for a specified partition and holder.
     * @dev Directly assigns the raw token balance in the internal `_balances` mapping.
     * @param _partition Partition identifier.
     * @param _holder Address of the token holder.
     * @param _amount Raw token balance to assign.
     */
    function setBalance(bytes32 _partition, address _holder, uint256 _amount) external {
        _balances[_partition][_holder] = _amount;
    }

    /// @inheritdoc ITransferByPartition
    /// @dev Minimal transfer stub for testing the `LoansPortfolio` withdrawal path. Decrements
    ///      the balance of the caller and increments the recipient balance in `_partition`.
    ///      Reverts with `InvalidPartition` if the caller holds fewer tokens than `value`.
    ///      Emits a `TransferByPartition` event.
    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes calldata _data
    ) external returns (bytes32) {
        address from = EvmAccessors.getMsgSender();
        address to = _basicTransferInfo.to;
        uint256 value = _basicTransferInfo.value;

        if (_balances[_partition][from] < value) {
            revert InvalidPartition(from, _partition);
        }

        _balances[_partition][from] -= value;
        _balances[_partition][to] += value;

        emit TransferByPartition(_partition, from, from, to, value, _data, "");

        return _partition;
    }

    /// @inheritdoc ITransferByPartition
    /// @dev No-op stub to satisfy the interface requirement in test scenarios.
    function initializeTransferByPartition() external {}

    /**
     * @notice Retrieves the loan details with configured fields populated.
     * @dev Returns `collateral.totalCollateralValue` and `loanPerformanceStatus.performanceStatus`
     *      as configured via `setLoanState`. All other struct fields return default values.
     *      Reverts with `MockLoanDetailsRevert` if configured to revert.
     * @return loanDetailsData_ Structured `LoanDetailsData` payload.
     */
    function getLoanDetails() external view returns (ILoan.LoanDetailsData memory loanDetailsData_) {
        if (_revertOnGetLoanDetails) {
            revert MockLoanDetailsRevert();
        }
        loanDetailsData_.collateral.totalCollateralValue = _totalCollateralValue;
        loanDetailsData_.loanPerformanceStatus.performanceStatus = _performanceStatus;
    }

    /**
     * @notice Retrieves the configured token balance for a partition and holder.
     * @dev Reads directly from `_balances`. Reverts with `MockBalanceOfByPartitionRevert`
     *      if configured to revert.
     * @param _partition Partition identifier.
     * @param _holder Address of the token holder.
     * @return Token balance assigned to the holder in the specified partition.
     */
    function balanceOfByPartition(bytes32 _partition, address _holder) external view returns (uint256) {
        if (_revertOnBalanceOfByPartition) {
            revert MockBalanceOfByPartitionRevert();
        }
        return _balances[_partition][_holder];
    }
}
