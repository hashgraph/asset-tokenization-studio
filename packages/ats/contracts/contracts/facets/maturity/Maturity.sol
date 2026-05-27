// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IMaturity, RESOLVER_KEY_MATURITY } from "./IMaturity.sol";
import { IKyc } from "../kyc/IKyc.sol";
import { ROLE_MATURITY_MANAGER, ROLE_MATURITY_REDEEMER } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { MaturityDateStorageWrapper } from "../../domain/asset/maturity/MaturityDateStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title  Maturity
 * @author Asset Tokenization Studio Team
 * @notice Maturity facet for token redemption and maturity date management.
 * @dev    `fullRedeemAtMaturity` and `updateMaturityDate` manage the token maturity lifecycle,
 *         registered under `RESOLVER_KEY_MATURITY`.
 *         Events: `MaturityDateUpdated`. Errors: `MaturityDateInvalid`.
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
        notZeroValue(_maturityDate)
        onlyValidMaturityDate(_maturityDate)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_MATURITY);
        MaturityDateStorageWrapper.initializeMaturity(_maturityDate);
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
}
