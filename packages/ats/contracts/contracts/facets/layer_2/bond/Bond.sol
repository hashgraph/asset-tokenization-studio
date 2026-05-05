// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondManagement } from "./IBondManagement.sol";
import { IKyc } from "../../layer_1/kyc/IKyc.sol";
import { MATURITY_REDEEMER_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Bond
 * @notice Abstract contract providing single-partition bond maturity redemption.
 * @dev Integrates with KYC verification, clearing controls, and access list modifiers.
 *      Inheriting contracts gain the partition-scoped redemption at maturity. Relies on
 *      ERC1410StorageWrapper for partition operations.
 * @author Asset Tokenization Studio Team
 */
abstract contract Bond is IBondManagement, Modifiers {
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
}
