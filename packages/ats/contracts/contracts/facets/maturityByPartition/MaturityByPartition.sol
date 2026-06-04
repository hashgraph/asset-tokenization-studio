// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturityByPartition, RESOLVER_KEY_MATURITY_BY_PARTITION } from "./IMaturityByPartition.sol";
import { IKyc } from "../kyc/IKyc.sol";
import { ROLE_MATURITY_REDEEMER } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title MaturityByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IMaturityByPartition` providing single-partition
 *         maturity redemption with full modifier chain enforcement.
 */
abstract contract MaturityByPartition is IMaturityByPartition, Modifiers {
    /// @inheritdoc IMaturityByPartition
    function initializeMaturityByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_MATURITY_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_MATURITY_BY_PARTITION);
        emit MaturityByPartitionInitialized();
    }

    /// @inheritdoc IMaturityByPartition
    function redeemAtMaturityByPartition(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _amount
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyClearingDisabled
        onlyRole(ROLE_MATURITY_REDEEMER)
        onlyAddressNotZero(_tokenHolder)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyListedAllowed(_tokenHolder)
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyMaturityReached
    {
        TokenCoreOps.redeemByPartition(_partition, _tokenHolder, EvmAccessors.getMsgSender(), _amount, "", "");
    }
}
