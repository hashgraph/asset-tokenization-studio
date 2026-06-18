// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILoan } from "../../facets/loan/ILoan.sol";
import { ITransferByPartition } from "../../facets/transferByPartition/ITransferByPartition.sol";

/**
 * @title MockLoanHolding
 * @author Asset Tokenization Studio Team
 * @notice Configurable test stand-in for a loan holding asset that the
 *         LoansPortfolio facet reads from at runtime.
 * @dev   Exposes exactly the two call surfaces the portfolio invokes:
 *        `getLoanDetails()` (collateral classification + performance status)
 *        and `balanceOfByPartition(...)` (ownership balance). Only the
 *        fields the portfolio reads are configurable; all other struct
 *        members return their type defaults.
 */
contract MockLoanHolding is ITransferByPartition {
    uint256 internal _totalCollateralValue;
    ILoan.PerformanceStatus internal _performanceStatus;
    mapping(bytes32 partition => mapping(address holder => uint256)) internal _balances;

    /**
     * @notice Sets the collateral value and performance classification.
     * @param totalCollateralValue_ Total collateral backing the loan.
     * @param performanceStatus_    Current repayment performance category.
     */
    function setLoanState(uint256 totalCollateralValue_, ILoan.PerformanceStatus performanceStatus_) external {
        _totalCollateralValue = totalCollateralValue_;
        _performanceStatus = performanceStatus_;
    }

    /**
     * @notice Sets the token balance for a given partition and holder.
     * @param _partition Partition identifier.
     * @param _holder    Address of the token holder.
     * @param _amount    Raw token balance to assign.
     */
    function setBalance(bytes32 _partition, address _holder, uint256 _amount) external {
        _balances[_partition][_holder] = _amount;
    }

    /**
     * @notice Minimal transfer-by-partition stub for the LoansPortfolio withdraw path.
     * @dev    Decrements `msg.sender`'s balance and increments the recipient's balance
     *         in `_partition`. Reverts with `InvalidPartition` when `msg.sender` holds
     *         fewer tokens than `value`. Intended solely for test scenarios where the
     *         portfolio withdraws loan holdings.
     * @param  _partition          Source partition.
     * @param  _basicTransferInfo  Recipient address and token amount.
     * @param  _data               Additional data (forwarded to the event, otherwise unused).
     * @return The partition identifier (`_partition`).
     */
    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes calldata _data
    ) external returns (bytes32) {
        address from = msg.sender;
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

    /**
     * @notice No-op stub required by `ITransferByPartition`.
     * @dev    The real initialiser is never called on the mock; this exists solely
     *         to satisfy the interface.
     */
    function initializeTransferByPartition() external {}

    /**
     * @notice Returns the loan details with configurable fields populated.
     * @dev    Only `collateral.totalCollateralValue` and
     *         `loanPerformanceStatus.performanceStatus` carry the values set
     *         via `setLoanState`; all other struct members return zero / their
     *         type default, matching the portfolio's read pattern.
     * @return loanDetailsData_ LoanDetailsData struct.
     */
    function getLoanDetails() external view returns (ILoan.LoanDetailsData memory loanDetailsData_) {
        loanDetailsData_.collateral.totalCollateralValue = _totalCollateralValue;
        loanDetailsData_.loanPerformanceStatus.performanceStatus = _performanceStatus;
    }

    /**
     * @notice Returns the configured token balance for a partition and holder.
     * @param  _partition Partition identifier.
     * @param  _holder    Address of the token holder.
     * @return The balance previously set via `setBalance`.
     */
    function balanceOfByPartition(bytes32 _partition, address _holder) external view returns (uint256) {
        return _balances[_partition][_holder];
    }
}
