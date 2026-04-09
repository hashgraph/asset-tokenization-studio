// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondManagement } from "./IBondManagement.sol";
import { IBondTypes } from "./IBondTypes.sol";
import { IKyc } from "../../layer_1/kyc/IKyc.sol";
import { _CORPORATE_ACTION_ROLE, _BOND_MANAGER_ROLE, _MATURITY_REDEEMER_ROLE } from "../../../constants/roles.sol";
import { KPI_BOND_REDEEM_BALANCE } from "../../../constants/values.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { BondStorageWrapper } from "../../../domain/asset/BondStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { InterestRateStorageWrapper } from "../../../domain/asset/InterestRateStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../../infrastructure/utils/UnexpectedError.sol";

error InterestRateIsKpiLinked();

/**
 * @title Bond
 * @dev Abstract contract for bond-specific operations
 *
 * Provides functionality for bond maturity redemption, coupon management,
 * and maturity date updates. Integrates with clearing, kyc, and control list modifiers.
 *
 * @notice Inherit from this contract to gain access to bond management functions
 * @author Asset Tokenization Studio Team
 */
abstract contract Bond is IBondManagement, TimestampProvider, Modifiers {
    /**
     * @dev Redeems all tokens at maturity for a token holder
     *
     * Requirements:
     * - Contract must not be paused
     * - Caller must have MATURITY_REDEEMER_ROLE
     * - Token holder must be on allowed list
     * - Token holder must have valid KYC status
     * - Maturity date must be valid
     * - Token holder address must be valid
     * - Token holder must not be recovered
     * - Clearing must be disabled
     *
     * @param _tokenHolder The token holder address
     *
     * Emits Transfer events for each partition redeemed
     */
    function fullRedeemAtMaturity(
        address _tokenHolder
    )
        external
        override
        onlyUnpaused
        onlyRole(_MATURITY_REDEEMER_ROLE)
        onlyValidAddress(_tokenHolder)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyListedAllowed(_tokenHolder)
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyValidMaturityDate(_getBlockTimestamp())
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
     * @dev Redeems tokens at maturity for a specific partition
     *
     * Requirements:
     * - Contract must not be paused
     * - Caller must have MATURITY_REDEEMER_ROLE
     * - Token holder must be on allowed list
     * - Token holder must have valid KYC status
     * - Maturity date must be valid
     * - Token holder address must be valid
     * - Partition must be default with single partition
     * - Token holder must not be recovered
     * - Clearing must be disabled
     *
     * @param _tokenHolder The token holder address
     * @param _partition The partition identifier
     * @param _amount The amount to redeem
     *
     * Emits Transfer event on success
     */
    function redeemAtMaturityByPartition(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _amount
    )
        external
        override
        onlyUnpaused
        onlyRole(_MATURITY_REDEEMER_ROLE)
        onlyValidAddress(_tokenHolder)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnrecoveredAddress(_tokenHolder)
        onlyListedAllowed(_tokenHolder)
        onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder)
        onlyValidMaturityDate(_getBlockTimestamp())
        onlyValidMaturityDate(_getBlockTimestamp())
    {
        ERC1410StorageWrapper.redeemByPartition(_partition, _tokenHolder, EvmAccessors.getMsgSender(), _amount, "", "");
    }

    /**
     * @dev Sets a new coupon for the bond
     *
     * Requirements:
     * - Contract must not be paused
     * - Caller must have CORPORATE_ACTION_ROLE
     * - Coupon dates must be valid
     * - Record and fixing dates must be valid timestamps
     *
     * @param _newCoupon The new coupon data
     * @return couponID_ The created coupon identifier
     *
     * Emits CouponSet event on success
     */
    function setCoupon(
        IBondTypes.Coupon calldata _newCoupon
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidDates(_newCoupon.startDate, _newCoupon.endDate)
        onlyValidDates(_newCoupon.recordDate, _newCoupon.executionDate)
        onlyValidDates(_newCoupon.fixingDate, _newCoupon.executionDate)
        onlyValidTimestamp(_newCoupon.recordDate)
        onlyValidTimestamp(_newCoupon.fixingDate)
        returns (uint256 couponID_)
    {
        IBondTypes.Coupon memory coupon = _prepareCoupon(_newCoupon);
        bytes32 corporateActionID;
        (corporateActionID, couponID_) = BondStorageWrapper.setCoupon(coupon);
    }

    /**
     * @dev Updates the bond maturity date
     *
     * Requirements:
     * - Contract must not be paused
     * - Caller must have BOND_MANAGER_ROLE
     * - New maturity date must be valid
     *
     * @param _newMaturityDate The new maturity timestamp
     * @return success_ Operation success status
     *
     * Emits MaturityDateUpdated event on success
     */
    function updateMaturityDate(
        uint256 _newMaturityDate
    )
        external
        override
        onlyUnpaused
        onlyRole(_BOND_MANAGER_ROLE)
        onlyValidMaturityDate(_newMaturityDate)
        returns (bool success_)
    {
        emit MaturityDateUpdated(address(this), _newMaturityDate, BondStorageWrapper.getMaturityDate());
        BondStorageWrapper.setMaturityDate(_newMaturityDate);
        return true;
    }

    function _prepareCoupon(IBondTypes.Coupon calldata _newCoupon) internal virtual returns (IBondTypes.Coupon memory) {
        // For KPI-linked rate bonds, rate must be PENDING (0), rate must be 0, and rateDecimals must be 0
        if (
            InterestRateStorageWrapper.isKpiLinkedRateInitialized() &&
            (_newCoupon.rateStatus != IBondTypes.RateCalculationStatus.PENDING ||
                _newCoupon.rate != 0 ||
                _newCoupon.rateDecimals != 0)
        ) revert InterestRateIsKpiLinked();
        return _newCoupon;
    }
}
