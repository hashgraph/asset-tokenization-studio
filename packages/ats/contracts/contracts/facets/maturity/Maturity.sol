// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturity } from "./IMaturity.sol";
import { IKyc } from "../layer_1/kyc/IKyc.sol";
import { ROLE_BOND_MANAGER, ROLE_MATURITY_REDEEMER } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { BondStorageWrapper } from "../../domain/asset/BondStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _MATURITY_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  Maturity
 * @author Asset Tokenization Studio Team
 * @notice Interface for bond maturity redemption and maturity date management.
 * @dev    `fullRedeemAtMaturity` and `updateMaturityDate` are extracted from the Bond facet
 *         into a dedicated Maturity facet registered under `_MATURITY_RESOLVER_KEY`.
 *         Events and errors — `MaturityDateUpdated` and `BondMaturityDateWrong` — are
 *         inherited from `IBondTypes`.
 * @author Asset Tokenization Studio Team
 */
abstract contract Maturity is IMaturity, Modifiers {
    /// @inheritdoc IMaturity
    function initializeMaturity()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_MATURITY_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_MATURITY_RESOLVER_KEY);
        emit MaturityInitialized();
    }

    /// @inheritdoc IMaturity
    function fullRedeemAtMaturity(
        address _tokenHolder
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyClearingDisabled
        onlyRole(ROLE_MATURITY_REDEEMER)
        onlyValidAddress(_tokenHolder)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyListedAllowed(_tokenHolder)
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyValidMaturityDate(TimeTravelStorageWrapper.getBlockTimestamp())
    {
        bytes32[] memory partitions = ERC1410StorageWrapper.partitionsOf(_tokenHolder);
        uint256 length = partitions.length;
        address sender = EvmAccessors.getMsgSender();
        for (uint256 i; i < length; ) {
            bytes32 partition = partitions[i];
            uint256 balance = ERC1410StorageWrapper.balanceOfByPartition(partition, _tokenHolder);
            if (balance != 0) {
                _redeemByPartition(partition, _tokenHolder, sender, balance);
            }
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IMaturity
    function updateMaturityDate(
        uint256 _newMaturityDate
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_BOND_MANAGER)
        onlyValidMaturityDate(_newMaturityDate)
        returns (bool success_)
    {
        emit MaturityDateUpdated(address(this), _newMaturityDate, BondStorageWrapper.getMaturityDate());
        BondStorageWrapper.setMaturityDate(_newMaturityDate);
        return true;
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
}
