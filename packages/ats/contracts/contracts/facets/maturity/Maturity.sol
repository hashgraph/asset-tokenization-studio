// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturity, RESOLVER_KEY_MATURITY } from "./IMaturity.sol";
import { IKyc } from "../kyc/IKyc.sol";
import { ROLE_MATURITY_MANAGER, ROLE_MATURITY_REDEEMER } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { MaturityDateStorageWrapper } from "../../domain/asset/MaturityDateStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
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
        _redeemPartitionsInRange(_tokenHolder, 0, ERC1410StorageWrapper.partitionsLength(_tokenHolder));
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
     * @dev Delegates the page-to-range math to `Pagination`, the same helper already used for
     *      every other paginated getter in this codebase: `getStartAndEnd` turns the page into
     *      a `[start, end)` pair, and `getSize` clamps it against the holder's partition count —
     *      handling a page whose start falls at or beyond that count, or whose end overruns it,
     *      as a smaller (possibly zero) size rather than reverting or underflowing.
     *      `ERC1410StorageWrapper.partitionsLength` is a single storage-slot read, so resolving
     *      the page never copies the holder's full partition list into memory.
     * @param _tokenHolder Token holder whose partitions are being redeemed.
     * @param _pageIndex   Zero-based index of the page of partitions to redeem.
     * @param _pageLength  Number of partitions per page.
     */
    function _redeemAtMaturityByPartitionRange(address _tokenHolder, uint256 _pageIndex, uint256 _pageLength) private {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = Pagination.getSize(start, end, ERC1410StorageWrapper.partitionsLength(_tokenHolder));
        _redeemPartitionsInRange(_tokenHolder, start, size);
    }

    /**
     * @notice Redeems the `_size` partitions of `_tokenHolder` starting at index `_start`.
     * @dev Shared by `fullRedeemAtMaturity` (full range) and `_redeemAtMaturityByPartitionRange`
     *      (a caller-supplied page), so both entry points redeem through the same loop instead
     *      of duplicating it. Reads each partition individually via
     *      `ERC1410StorageWrapper.partitionAt` — never the holder's full partition list — so a
     *      page never costs more gas than its own length regardless of how many partitions the
     *      holder has in total. Walks the range from its highest index down to `_start` rather
     *      than snapshotting it first: redeeming a partition always drains it to zero balance,
     *      which removes it via swap-and-pop (the holder's current last partition is moved into
     *      the freed slot, then the array shrinks by one). That move only ever touches the slot
     *      just emptied and the array's tail — both at or beyond the index just processed —
     *      so it never disturbs the lower indices still left to visit. Reverts with an
     *      unexpected error if any partition in range has a zero balance.
     * @param _tokenHolder Token holder whose balances are being redeemed.
     * @param _start       Index of the first partition to redeem.
     * @param _size        Number of partitions to redeem, starting at `_start`.
     */
    function _redeemPartitionsInRange(address _tokenHolder, uint256 _start, uint256 _size) private {
        address sender = EvmAccessors.getMsgSender();
        for (uint256 i = _size; i > 0; ) {
            unchecked {
                --i;
            }
            bytes32 partition = ERC1410StorageWrapper.partitionAt(_tokenHolder, _start + i);
            uint256 balance = ERC1410StorageWrapper.balanceOfByPartition(partition, _tokenHolder);
            _checkUnexpectedError(balance == 0, MATURITY_ZERO_BALANCE_PARTITION);
            _redeemByPartition(partition, _tokenHolder, sender, balance);
        }
    }
}
