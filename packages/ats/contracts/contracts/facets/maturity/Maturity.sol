// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturity, RESOLVER_KEY_MATURITY } from "./IMaturity.sol";
import { IKyc } from "../kyc/IKyc.sol";
import { ROLE_MATURITY_MANAGER, ROLE_MATURITY_REDEEMER } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { MaturityDateStorageWrapper } from "../../domain/asset/MaturityDateStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";
import { MATURITY_ZERO_BALANCE_PARTITION } from "../../constants/values.sol";

/**
 * @title  Maturity
 * @author Asset Tokenization Studio Team
 * @notice Maturity facet for token redemption and maturity date management.
 * @dev    `fullRedeemAtMaturity`, `redeemAtMaturityByPartitionRange` and `updateMaturityDate`
 *         manage the token maturity lifecycle, registered under `RESOLVER_KEY_MATURITY`.
 *         Events: `MaturityInitialized`, `MaturityDateUpdated`, `FullyRedeemedAtMaturity`,
 *         `RedeemedAtMaturityByPartitionRange`. Errors: `MaturityDateInvalid`.
 */
abstract contract Maturity is IMaturity, Modifiers {
    /// @inheritdoc IMaturity
    function initializeMaturity(
        uint256 _maturityDate
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_MATURITY)
        onlyValidMaturityDate(_maturityDate)
    {
        MaturityDateStorageWrapper.setMaturityDate(_maturityDate);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_MATURITY);
        emit MaturityInitialized(_maturityDate);
    }

    /// @inheritdoc IMaturity
    function fullRedeemAtMaturity(
        address _tokenHolder
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyClearingDisabled
        onlyRole(ROLE_MATURITY_REDEEMER)
        validateAddressNotZero(_tokenHolder)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyListedAllowed(_tokenHolder)
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyMaturityReached
    {
        bytes32[] memory partitions = ERC1410StorageWrapper.partitionsOf(_tokenHolder);
        _redeemPartitionsInRange(_tokenHolder, partitions, 0, partitions.length);
        emit FullyRedeemedAtMaturity(_tokenHolder);
    }

    /// @inheritdoc IMaturity
    function redeemAtMaturityByPartitionRange(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyClearingDisabled
        onlyRole(ROLE_MATURITY_REDEEMER)
        validateAddressNotZero(_tokenHolder)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyListedAllowed(_tokenHolder)
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyMaturityReached
    {
        _redeemAtMaturityByPartitionRange(_tokenHolder, _pageIndex, _pageLength);
        emit RedeemedAtMaturityByPartitionRange(_tokenHolder, _pageIndex, _pageLength);
    }

    /// @inheritdoc IMaturity
    function updateMaturityDate(
        uint256 _newMaturityDate
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_MATURITY_MANAGER)
        onlyValidMaturityDate(_newMaturityDate)
        returns (bool success_)
    {
        emit MaturityDateUpdated(address(this), _newMaturityDate, MaturityDateStorageWrapper.getMaturityDate());
        MaturityDateStorageWrapper.setMaturityDate(_newMaturityDate);
        return true;
    }

    /// @inheritdoc IMaturity
    function getMaturityDate() external view override returns (uint256 maturityDate_) {
        return MaturityDateStorageWrapper.getMaturityDate();
    }

    /**
     * @notice Routes a single-partition redeem through `TokenCoreOps.redeemByPartition`.
     * @dev Extracted to a `private` helper so the DELEGATECALL setup happens in a fresh
     *      stack frame; the enclosing `fullRedeemAtMaturity` carries 9 modifiers plus 6
     *      live loop locals, which exceeds the Solidity 16-slot stack window when the
     *      6-arg call is inlined into the loop body.
     * @param _partition  Partition holding the balance to redeem.
     * @param _holder     Token holder whose balance is being redeemed.
     * @param _sender     Operator initiating the redemption (msg.sender at the entry point).
     * @param _amount     Balance to redeem from the partition.
     */
    function _redeemByPartition(bytes32 _partition, address _holder, address _sender, uint256 _amount) private {
        TokenCoreOps.redeemByPartition(_partition, _holder, _sender, _amount, "", "");
    }

    /**
     * @notice Resolves a caller-supplied page into a partition-index range and redeems it.
     * @dev Computes `_start = _pageIndex * _pageLength` and `_end = _start + _pageLength`,
     *      clamped to `partitions.length`, then delegates to `_redeemPartitionsInRange`. When
     *      `_start` falls at or beyond `partitions.length`, clamping makes `_end <= _start` and
     *      the range redeems nothing rather than reverting.
     * @param _tokenHolder Token holder whose partitions are being redeemed.
     * @param _pageIndex   Zero-based index of the page of partitions to redeem.
     * @param _pageLength  Number of partitions per page.
     */
    function _redeemAtMaturityByPartitionRange(address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) private {
        bytes32[] memory partitions = ERC1410StorageWrapper.partitionsOf(_tokenHolder);
        uint256 start = _pageIndex * _pageLength;
        uint256 end = start + _pageLength;
        _redeemPartitionsInRange(_tokenHolder, partitions, start, end > partitions.length ? partitions.length : end);
    }

    /**
     * @notice Redeems every partition in `[_start, _end)` of `_partitions` for `_tokenHolder`.
     * @dev Shared by `fullRedeemAtMaturity` (full range) and `_redeemAtMaturityByPartitionRange`
     *      (a caller-supplied page), so both entry points redeem through the same loop instead
     *      of duplicating it. Reverts with an unexpected error if any partition in range has a
     *      zero balance.
     * @param _tokenHolder Token holder whose balances are being redeemed.
     * @param _partitions  Full partition list to index into; only `[_start, _end)` is processed.
     * @param _start       Inclusive index of the first partition to redeem.
     * @param _end         Exclusive index one past the last partition to redeem.
     */
    function _redeemPartitionsInRange(
        address _tokenHolder,
        bytes32[] memory _partitions,
        uint256 _start,
        uint256 _end
    ) private {
        address sender = EvmAccessors.getMsgSender();
        for (uint256 i = _start; i < _end; ) {
            bytes32 partition = _partitions[i];
            uint256 balance = ERC1410StorageWrapper.balanceOfByPartition(partition, _tokenHolder);
            _checkUnexpectedError(balance == 0, MATURITY_ZERO_BALANCE_PARTITION);
            _redeemByPartition(partition, _tokenHolder, sender, balance);
            unchecked {
                ++i;
            }
        }
    }
}
