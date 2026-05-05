// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturity } from "./IMaturity.sol";
import { IKyc } from "../layer_1/kyc/IKyc.sol";
import { BOND_MANAGER_ROLE, MATURITY_REDEEMER_ROLE } from "../../constants/roles.sol";
import { KPI_BOND_REDEEM_BALANCE } from "../../constants/values.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { BondStorageWrapper } from "../../domain/asset/BondStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/**
 * @title  Maturity
 * @notice Abstract implementation of `IMaturity` providing bond maturity redemption and maturity
 *         date management capabilities.
 * @dev    Delegates partition operations to `ERC1410StorageWrapper` and maturity date persistence
 *         to `BondStorageWrapper`. Access and state guards are applied via `Modifiers`. Intended
 *         to be inherited by `MaturityFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract Maturity is IMaturity, Modifiers {
    /// @inheritdoc IMaturity
    /// @dev Emits {RedeemedByPartition} for each partition via
    ///      `ERC1410StorageWrapper.redeemByPartition`.
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
        for (uint256 i; i < partitions.length; i++) {
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

    /// @inheritdoc IMaturity
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
