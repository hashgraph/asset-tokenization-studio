// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondManagement } from "./IBondManagement.sol";
import { IKyc } from "../../layer_1/kyc/IKyc.sol";
import { BOND_MANAGER_ROLE, MATURITY_REDEEMER_ROLE } from "../../../constants/roles.sol";
import { KPI_BOND_REDEEM_BALANCE } from "../../../constants/values.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../../infrastructure/utils/UnexpectedError.sol";

/**
 * @title Bond
 * @notice Abstract contract providing bond maturity redemption
 *         and maturity date management capabilities.
 * @dev Integrates with KYC verification, clearing controls, and
 *      access list modifiers. Inheriting contracts gain bond-
 *      specific redemption and maturity update functions. Relies
 *      on ERC1410StorageWrapper for partition operations and
 *      BondStorageWrapper for maturity date persistence.
 * @author Asset Tokenization Studio Team
 */
abstract contract Bond is IBondManagement, Modifiers {
    /**
     * @notice Redeems all token partitions held by a token
     *         holder at bond maturity.
     * @dev Caller must hold MATURITY_REDEEMER_ROLE. Contract
     *      must be unpaused and clearing disabled. Token holder
     *      must be on the allowed list with granted KYC status,
     *      must not be recovered, and the maturity date must
     *      have passed. Iterates all partitions and redeems
     *      each balance. Reverts with an unexpected error if any
     *      partition balance is zero. Emits Transfer events for
     *      each partition redeemed via ERC1410StorageWrapper.
     * @param _tokenHolder Address of the token holder to redeem
     */
    function fullRedeemAtMaturity(
        address _tokenHolder
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        onlyRole(MATURITY_REDEEMER_ROLE)
        onlyValidAddress(_tokenHolder)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyListedAllowed(_tokenHolder)
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyValidMaturityDate(TimeTravelStorageWrapper.getBlockTimestamp())
    {
        bytes32[] memory partitions = ERC1410StorageWrapper.partitionsOf(_tokenHolder);
        for (uint256 i = 0; i < partitions.length; i++) {
            bytes32 partition = partitions[i];
            uint256 balance = ERC1410StorageWrapper.balanceOfByPartition(partition, _tokenHolder);
            _checkUnexpectedError(balance == 0, KPI_BOND_REDEEM_BALANCE);
            ERC1410StorageWrapper.redeemByPartition(
                partition,
                _tokenHolder,
                EvmAccessors.getMsgSender(),
                balance,
                "",
                ""
            );
        }
    }

    /**
     * @notice Redeems a specified amount of tokens from a
     *         single partition at bond maturity.
     * @dev Caller must hold MATURITY_REDEEMER_ROLE. Contract
     *      must be unpaused and clearing disabled. Token holder
     *      must be on the allowed list with granted KYC status,
     *      must not be recovered, and the maturity date must
     *      have passed. The partition must be the default
     *      partition when a single partition is configured.
     *      Emits a Transfer event on successful redemption via
     *      ERC1410StorageWrapper.
     * @param _tokenHolder Address of the token holder to redeem
     * @param _partition Partition identifier to redeem from
     * @param _amount Amount of tokens to redeem
     */
    function redeemAtMaturityByPartition(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyClearingDisabled
        onlyRole(MATURITY_REDEEMER_ROLE)
        onlyValidAddress(_tokenHolder)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyListedAllowed(_tokenHolder)
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyValidMaturityDate(TimeTravelStorageWrapper.getBlockTimestamp())
    {
        ERC1410StorageWrapper.redeemByPartition(_partition, _tokenHolder, EvmAccessors.getMsgSender(), _amount, "", "");
    }

    /**
     * @notice Updates the bond maturity date to a new timestamp.
     * @dev Caller must hold BOND_MANAGER_ROLE. Contract must be
     *      unpaused. The new maturity date must satisfy the
     *      validity check enforced by the onlyValidMaturityDate
     *      modifier. Emits MaturityDateUpdated with the contract
     *      address, new maturity date, and previous maturity
     *      date. State mutation: persists the new maturity date
     *      via BondStorageWrapper.
     * @param _newMaturityDate New maturity timestamp to set
     * @return success_ Whether the operation succeeded
     */
    function updateMaturityDate(
        uint256 _newMaturityDate
    )
        external
        override
        onlyUnpaused
        onlyRole(BOND_MANAGER_ROLE)
        onlyValidMaturityDate(_newMaturityDate)
        returns (bool success_)
    {
        emit MaturityDateUpdated(address(this), _newMaturityDate, BondStorageWrapper.getMaturityDate());
        BondStorageWrapper.setMaturityDate(_newMaturityDate);
        return true;
    }
}
