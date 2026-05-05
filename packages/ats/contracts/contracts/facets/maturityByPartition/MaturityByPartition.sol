// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturityByPartition } from "./IMaturityByPartition.sol";
import { IKyc } from "../layer_1/kyc/IKyc.sol";
import { MATURITY_REDEEMER_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title MaturityByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IMaturityByPartition` providing single-partition
 *         bond maturity redemption with full modifier chain enforcement.
 * @dev Delegates storage writes to `ERC1410StorageWrapper.redeemByPartition`. Preserves
 *      all modifier semantics from the original `Bond.redeemAtMaturityByPartition`
 *      implementation. Intended to be inherited by `MaturityByPartitionFacet`.
 */
abstract contract MaturityByPartition is IMaturityByPartition, Modifiers {
    /// @inheritdoc IMaturityByPartition
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
