// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { ClearingReadOps } from "./ClearingReadOps.sol";
import { LockStorageWrapper } from "../asset/LockStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../asset/ERC1594StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { IERC1410Types } from "../../facets/commonTypes/IERC1410Types.sol";
import { IProtectedPartitions } from "../../facets/protectedPartitions/IProtectedPartitions.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IPrincipal } from "../../facets/principal/IPrincipal.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { DecimalsLib } from "../../infrastructure/utils/DecimalsLib.sol";
import { NominalValueStorageWrapper } from "../asset/NominalValueStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/// @title TokenCoreOps - Orchestrator for core token operations
/// @author Asset Tokenization Studio Team
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL.
/// @dev Contains balance operations for ClearingOps to avoid inlining.
library TokenCoreOps {
    /// @notice Transfers tokens on a specific partition, delegating to ERC-1410 storage.
    /// @param _from Source address.
    /// @param _basicTransferInfo Struct carrying recipient address and value.
    /// @param _partition Partition identifier for the transfer.
    /// @param _data Additional data attached to the transfer.
    /// @param _operator Address of the operator initiating the transfer.
    /// @param _operatorData Additional data supplied by the operator.
    /// @return The partition from which tokens were transferred.
    function transferByPartition(
        address _from,
        IERC1410Types.BasicTransferInfo memory _basicTransferInfo,
        bytes32 _partition,
        bytes memory _data,
        address _operator,
        bytes memory _operatorData
    ) external returns (bytes32) {
        return
            ERC1410StorageWrapper.transferByPartition(
                _from,
                _basicTransferInfo,
                _partition,
                _data,
                _operator,
                _operatorData
            );
    }

    /// @notice Executes an operator-initiated transfer by partition using packed transfer data.
    /// @param _operatorTransferData Struct containing all fields required for an operator transfer.
    /// @return The partition from which tokens were transferred.
    function operatorTransferByPartition(
        IERC1410Types.OperatorTransferData calldata _operatorTransferData
    ) external returns (bytes32) {
        return ERC1410StorageWrapper.operatorTransferByPartition(_operatorTransferData);
    }

    /// @notice Executes a protected transfer from a token holder on a given partition.
    /// @param _partition Partition identifier for the transfer.
    /// @param _from Source address from which tokens are transferred.
    /// @param _to Destination address receiving the tokens.
    /// @param _amount Number of tokens to transfer.
    /// @param _protectionData Protection metadata authorising the transfer.
    /// @return The partition from which tokens were transferred.
    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) external returns (bytes32) {
        return ERC1410StorageWrapper.protectedTransferFromByPartition(_partition, _from, _to, _amount, _protectionData);
    }

    /// @notice Issues tokens on a specific partition using packed issue data.
    /// @param _issueData Struct containing partition, recipient, value, and associated data.
    function issueByPartition(IERC1410Types.IssueData memory _issueData) external {
        ERC1410StorageWrapper.issueByPartition(_issueData);
    }

    /// @notice Redeems tokens from a token holder on a specific partition.
    /// @param _partition Partition identifier for the redemption.
    /// @param _from Address from which tokens are redeemed.
    /// @param _operator Address of the operator initiating the redemption.
    /// @param _value Number of tokens to redeem.
    /// @param _data Additional data attached to the redemption.
    /// @param _operatorData Additional data supplied by the operator.
    function redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) external {
        ERC1410StorageWrapper.redeemByPartition(_partition, _from, _operator, _value, _data, _operatorData);
    }

    /// @notice Executes a protected redemption from a token holder on a given partition.
    /// @param _partition Partition identifier for the redemption.
    /// @param _from Address from which tokens are redeemed.
    /// @param _amount Number of tokens to redeem.
    /// @param _protectionData Protection metadata authorising the redemption.
    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    ) external {
        ERC1410StorageWrapper.protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);
    }

    /// @notice Transfers tokens on the default ERC-20 balance, delegating to ERC-20 storage.
    /// @param _from Source address.
    /// @param _to Destination address.
    /// @param _value Number of tokens to transfer.
    /// @return True if the transfer succeeded.
    function transfer(address _from, address _to, uint256 _value) external returns (bool) {
        return ERC20StorageWrapper.transfer(_from, _to, _value);
    }

    /// @notice Transfers tokens on behalf of a token holder, delegating to ERC-20 storage.
    /// @param _spender Address acting on behalf of `_from`.
    /// @param _from Source address from which tokens are debited.
    /// @param _to Destination address receiving the tokens.
    /// @param _value Number of tokens to transfer.
    /// @return True if the transfer succeeded.
    function transferFrom(address _spender, address _from, address _to, uint256 _value) external returns (bool) {
        return ERC20StorageWrapper.transferFrom(_spender, _from, _to, _value);
    }

    /// @notice Mints new tokens to a recipient address, delegating to ERC-20 storage.
    /// @param _to Address receiving the newly minted tokens.
    /// @param _value Number of tokens to mint.
    function mint(address _to, uint256 _value) external {
        ERC20StorageWrapper.mint(_to, _value);
    }

    /// @notice Burns tokens from a holder's address, delegating to ERC-20 storage.
    /// @param _from Address from which tokens are burned.
    /// @param _value Number of tokens to burn.
    function burn(address _from, uint256 _value) external {
        ERC20StorageWrapper.burn(_from, _value);
    }

    /// @notice Issues tokens to a token holder via the ERC-1594 issuance path.
    /// @param _tokenHolder Address to receive the newly issued tokens.
    /// @param _value Number of tokens to issue.
    function issue(address _tokenHolder, uint256 _value) external {
        ERC1594StorageWrapper.issue(_tokenHolder, _value);
    }

    /// @notice Redeems tokens from the caller's balance via the ERC-1594 redemption path.
    /// @param _value Number of tokens to redeem.
    function redeem(uint256 _value) external {
        ERC1594StorageWrapper.redeem(_value);
    }

    /// @notice Redeems tokens from a specified token holder via the ERC-1594 redemption path.
    /// @param _tokenHolder Address from which tokens are redeemed.
    /// @param _value Number of tokens to redeem.
    function redeemFrom(address _tokenHolder, uint256 _value) external {
        ERC1594StorageWrapper.redeemFrom(_tokenHolder, _value);
    }

    /// @notice Approves a spender to transfer tokens on behalf of an owner.
    /// @param _owner Address granting the allowance.
    /// @param _spender Address approved to spend tokens.
    /// @param _value Allowance amount being granted.
    /// @return True if the approval succeeded.
    function approve(address _owner, address _spender, uint256 _value) external returns (bool) {
        return ERC20StorageWrapper.approve(_owner, _spender, _value);
    }

    /// @notice Increases the allowance granted to a spender by the caller.
    /// @param _spender Address whose allowance is increased.
    /// @param _addedValue Additional amount to add to the current allowance.
    /// @return True if the increase succeeded.
    function increaseAllowance(address _spender, uint256 _addedValue) external returns (bool) {
        return ERC20StorageWrapper.increaseAllowance(_spender, _addedValue);
    }

    /// @notice Decreases the allowance granted to a spender by the caller.
    /// @param _spender Address whose allowance is decreased.
    /// @param _subtractedValue Amount to subtract from the current allowance.
    /// @return True if the decrease succeeded.
    function decreaseAllowance(address _spender, uint256 _subtractedValue) external returns (bool) {
        return ERC20StorageWrapper.decreaseAllowance(_spender, _subtractedValue);
    }

    /// @notice Hook invoked before any allowance change to perform pre-update checks.
    /// @param _owner Address whose allowance is about to change.
    /// @param _spender Address whose spending limit is about to change.
    function beforeAllowanceUpdate(address _owner, address _spender) external {
        ERC20StorageWrapper.beforeAllowanceUpdate(_owner, _spender);
    }

    /// @notice Transfers tokens on the default partition, delegating to ERC-20 storage.
    /// @dev The `Transfer` event is emitted by `ERC20StorageWrapper.performTransfer` internally.
    /// @param _from    Source address.
    /// @param _to      Destination address.
    /// @param _amount  Amount to transfer.
    function transferDefaultPartition(address _from, address _to, uint256 _amount) external {
        ERC20StorageWrapper.transfer(_from, _to, _amount);
    }

    /// @notice Increases the tracked allowed balance for a spender on behalf of an owner.
    /// @param _owner Address whose allowed balance is being increased.
    /// @param _spender Address for whom the allowed balance is increased.
    /// @param _amount Amount by which the allowed balance is increased.
    function increaseAllowedBalance(address _owner, address _spender, uint256 _amount) external {
        ERC20StorageWrapper.increaseAllowedBalance(_owner, _spender, _amount);
    }

    /// @notice Decreases the tracked allowed balance for a spender on behalf of an owner.
    /// @param _owner Address whose allowed balance is being decreased.
    /// @param _spender Address for whom the allowed balance is decreased.
    /// @param _amount Amount by which the allowed balance is decreased.
    function decreaseAllowedBalance(address _owner, address _spender, uint256 _amount) external {
        ERC20StorageWrapper.decreaseAllowedBalance(_owner, _spender, _amount);
    }

    /// @notice Records the current balance of an account on a partition as a snapshot entry.
    /// @param _account Address of the account whose snapshot is updated.
    /// @param _partition Partition identifier for which the snapshot is taken.
    function updateAccountSnapshot(address _account, bytes32 _partition) external {
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _partition);
    }

    /// @notice Records the current cleared balance of an account on a partition as a snapshot entry.
    /// @param _account Address of the account whose cleared-balance snapshot is updated.
    /// @param _partition Partition identifier for which the snapshot is taken.
    function updateAccountClearedBalancesSnapshot(address _account, bytes32 _partition) external {
        SnapshotsStorageWrapper.updateAccountClearedBalancesSnapshot(_account, _partition);
    }

    /// @notice Triggers and synchronises all pending balance adjustments for a partition transfer.
    /// @param _partition Partition identifier on which adjustments are applied.
    /// @param _from Source address involved in the transfer.
    /// @param _to Destination address involved in the transfer.
    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _from, _to);
    }

    /// @notice Validates that both transfer parties hold a verified on-chain identity.
    /// @param _from Address of the sender being verified.
    /// @param _to Address of the recipient being verified.
    function checkIdentity(address _from, address _to) external view {
        ERC1594StorageWrapper.checkIdentity(_from, _to);
    }

    /// @notice Validates that a transfer between two parties satisfies compliance rules.
    /// @param _from Address of the sender being checked.
    /// @param _to Address of the recipient being checked.
    /// @param _checkSender When true, the compliance check also validates the sender's status.
    function checkCompliance(address _from, address _to, bool _checkSender) external view {
        ERC1594StorageWrapper.checkCompliance(_from, _to, _checkSender);
    }

    // Internal functions (inlined into calling StorageWrappers)

    /// @notice Computes the total adjusted balance for a token holder at a given timestamp.
    /// @dev Sums the spendable balance, locked, held, cleared, and frozen amounts, each
    ///      scaled by their respective ABAF factors.
    /// @param _tokenHolder Address of the token holder.
    /// @param _timestamp   Block timestamp used for the ABAF adjustment calculation.
    /// @return totalBalance_ Aggregate adjusted balance including frozen tokens.
    function getTotalBalanceForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 totalBalance_) {
        totalBalance_ =
            AdjustBalancesStorageWrapper.balanceOfAdjustedAt(_tokenHolder, _timestamp) +
            LockStorageWrapper.getLockedAmountForAdjustedAt(_tokenHolder, _timestamp) +
            HoldStorageWrapper.getHeldAmountForAdjustedAt(_tokenHolder, _timestamp) +
            ClearingReadOps.getClearedAmountForAdjustedAt(_tokenHolder, _timestamp) +
            ERC3643StorageWrapper.getFrozenAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    function getTotalBalanceForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 totalBalance_) {
        totalBalance_ =
            AdjustBalancesStorageWrapper.balanceOfByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            LockStorageWrapper.getLockedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            HoldStorageWrapper.getHeldAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            ClearingReadOps.getClearedAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }

    /**
     * @notice Computes the principal position for `account` at the current block timestamp.
     * @param  account      Token holder address.
     * @return principalFor_ Numerator/denominator pair representing the holder's principal.
     */
    function getPrincipalFor(address account) internal view returns (IPrincipal.PrincipalFor memory principalFor_) {
        uint256 blockTimestamp = TimeTravelStorageWrapper.getBlockTimestamp();

        // Pre-apply the nominal-value scale via 512-bit mulDiv: balance * nominal stays bounded
        // even at high precision, and the equivalent fraction keeps the token-decimal scale on
        // the denominator so sub-unit balances survive (numerator/denominator == old fraction).
        principalFor_.numerator = Math.mulDiv(
            TokenCoreOps.getTotalBalanceForAdjustedAt(account, blockTimestamp),
            NominalValueStorageWrapper.getNominalValue(),
            DecimalsLib.pow10(NominalValueStorageWrapper.getNominalValueDecimals())
        );
        principalFor_.denominator = DecimalsLib.pow10(ERC20StorageWrapper.decimalsAdjustedAt(blockTimestamp));
    }
}
