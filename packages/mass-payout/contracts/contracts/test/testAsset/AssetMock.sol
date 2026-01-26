// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.22;

import { IAssetMock } from "./interfaces/IAssetMock.sol";
import { IFactory } from "@hashgraph/asset-tokenization-contracts/contracts/interfaces/factory/IFactory.sol";

// solhint-disable no-unused-vars
contract AssetMock is IAssetMock {
    IFactory.SecurityType private _securityType;
    bool private _withHolders;
    uint256 private _numerator;

    constructor(IFactory.SecurityType _secType, bool _wHolders, uint256 _amountNumerator) {
        _securityType = _secType;
        _withHolders = _wHolders;
        _numerator = _amountNumerator;
    }

    function getERC20Metadata() external view returns (ERC20Metadata memory erc20Metadata_) {
        erc20Metadata_.info.name = "Mock Asset";
        erc20Metadata_.info.symbol = "MOCK";
        erc20Metadata_.info.isin = "MK0322861238";
        erc20Metadata_.info.decimals = 6;
        erc20Metadata_.securityType = _securityType;
    }

    function getCouponHolders(uint256, uint256, uint256) external view returns (address[] memory holders_) {
        if (!_withHolders) return new address[](0);
        holders_ = new address[](1);
        holders_[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    }

    function getSecurityHolders(uint256, uint256) external view returns (address[] memory holders_) {
        if (!_withHolders) return new address[](0);
        holders_ = new address[](1);
        holders_[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    }

    function getDividendHolders(uint256, uint256, uint256) external view returns (address[] memory holders_) {
        if (!_withHolders) return new address[](0);
        holders_ = new address[](1);
        holders_[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    }

    function getTokenHoldersAtSnapshot(uint256, uint256, uint256) external view returns (address[] memory holders_) {
        if (!_withHolders) return new address[](0);
        holders_ = new address[](2);
        holders_[0] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        holders_[1] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    }

    function getPrincipalFor(address) external view returns (PrincipalFor memory principalFor_) {
        principalFor_.numerator = _numerator;
        principalFor_.denominator = 1;
    }

    function getCouponAmountFor(uint256, address) external view returns (CouponAmountFor memory couponAmountFor_) {
        couponAmountFor_.numerator = _numerator;
        couponAmountFor_.denominator = 1;
        couponAmountFor_.recordDateReached = true;
    }

    function getDividendAmountFor(
        uint256,
        address
    ) external view returns (DividendAmountFor memory dividendAmountFor_) {
        dividendAmountFor_.numerator = _numerator;
        dividendAmountFor_.denominator = 1;
        dividendAmountFor_.recordDateReached = true;
    }

    function decreaseAllowance(address, uint256) external pure returns (bool) {
        revert NotImplemented();
    }

    // solhint-disable no-empty-blocks
    function fullRedeemAtMaturity(address) external pure {}

    function increaseAllowance(address, uint256) external pure returns (bool) {
        revert NotImplemented();
    }

    function redeemAtMaturityByPartition(address, bytes32, uint256) external pure {
        return;
    }

    function setCoupon(Coupon calldata) external pure returns (uint256) {
        revert NotImplemented();
    }

    function updateMaturityDate(uint256) external pure returns (bool) {
        revert NotImplemented();
    }

    function getBondDetails() external pure returns (BondDetailsData memory bondDetailsData_) {
        bondDetailsData_.currency = 0x555344;
        bondDetailsData_.nominalValue = 2345678901;
        bondDetailsData_.nominalValueDecimals = 2;
        bondDetailsData_.startingDate = 1751282807;
        bondDetailsData_.maturityDate = 1761823607;
    }

    function getCoupon(uint256) external pure returns (RegisteredCoupon memory registeredCoupon_) {
        registeredCoupon_.coupon.recordDate = 1753874807;
        registeredCoupon_.coupon.executionDate = 1753874807;
        registeredCoupon_.coupon.startDate = 1;
        registeredCoupon_.coupon.endDate = 2592001;
        registeredCoupon_.coupon.fixingDate = 1753874808;
        registeredCoupon_.coupon.rate = 1;
        registeredCoupon_.coupon.rateDecimals = 1;
        registeredCoupon_.snapshotId = 1;
    }

    function getCouponFor(uint256, address) external pure returns (CouponFor memory couponFor_) {
        couponFor_.tokenBalance = 3;
        couponFor_.decimals = 2;
        couponFor_.recordDateReached = true;
        couponFor_.coupon.rate = 2;
        couponFor_.coupon.recordDate = 1753874807;
        couponFor_.coupon.executionDate = 1753874807;
        couponFor_.coupon.startDate = 1;
        couponFor_.coupon.endDate = 2592001;
        couponFor_.coupon.fixingDate = 1753874808;
        couponFor_.coupon.rateDecimals = 1;
    }

    function getCouponCount() external pure returns (uint256) {
        revert NotImplemented();
    }

    function getTotalCouponHolders(uint256) external pure returns (uint256) {
        revert NotImplemented();
    }

    function setDividends(Dividend calldata) external pure returns (uint256) {
        revert NotImplemented();
    }

    function setVoting(Voting calldata) external pure returns (uint256) {
        revert NotImplemented();
    }

    function setScheduledBalanceAdjustment(ScheduledBalanceAdjustment calldata) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getEquityDetails() external pure returns (EquityDetailsData memory equityDetailsData_) {
        equityDetailsData_.votingRight = true;
        equityDetailsData_.informationRight = true;
        equityDetailsData_.liquidationRight = true;
        equityDetailsData_.subscriptionRight = true;
        equityDetailsData_.conversionRight = false;
        equityDetailsData_.redemptionRight = false;
        equityDetailsData_.putRight = false;
        equityDetailsData_.dividendRight = DividendType.COMMON;
        equityDetailsData_.currency = 0x555344;
        equityDetailsData_.nominalValue = 1000000;
        equityDetailsData_.nominalValueDecimals = 2;
    }

    function getDividends(uint256) external pure returns (RegisteredDividend memory registeredDividend_) {
        registeredDividend_.dividend.recordDate = 1753874807;
        registeredDividend_.dividend.executionDate = 1753874807;
        registeredDividend_.dividend.amount = 400;
        registeredDividend_.dividend.amountDecimals = 2;
        registeredDividend_.snapshotId = 1;
    }

    function getDividendsFor(uint256, address) external pure returns (DividendFor memory dividendFor_) {
        dividendFor_.tokenBalance = 3;
        dividendFor_.amount = 200;
        dividendFor_.amountDecimals = 2;
        dividendFor_.recordDate = 1753874807;
        dividendFor_.executionDate = 1753874807;
        dividendFor_.decimals = 2;
        dividendFor_.recordDateReached = true;
    }

    function getDividendsCount() external pure returns (uint256) {
        revert NotImplemented();
    }

    function getTotalDividendHolders(uint256) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getVoting(uint256) external pure returns (RegisteredVoting memory) {
        revert NotImplemented();
    }

    function getVotingFor(uint256, address) external pure returns (VotingFor memory) {
        revert NotImplemented();
    }

    function getVotingCount() external pure returns (uint256) {
        revert NotImplemented();
    }

    function getVotingHolders(uint256, uint256, uint256) external pure returns (address[] memory) {
        revert NotImplemented();
    }

    function getTotalVotingHolders(uint256) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getScheduledBalanceAdjustment(uint256) external pure returns (ScheduledBalanceAdjustment memory) {
        revert NotImplemented();
    }

    function getScheduledBalanceAdjustmentCount() external pure returns (uint256) {
        revert NotImplemented();
    }

    function takeSnapshot() external pure returns (uint256) {
        revert NotImplemented();
    }

    function balanceOfAtSnapshotByPartition(bytes32, uint256, address) external pure returns (uint256) {
        revert NotImplemented();
    }

    function partitionsOfAtSnapshot(uint256, address) external pure returns (bytes32[] memory) {
        revert NotImplemented();
    }

    function totalSupplyAtSnapshotByPartition(bytes32, uint256) external pure returns (uint256) {
        revert NotImplemented();
    }

    function lockedBalanceOfAtSnapshot(uint256, address) external pure returns (uint256) {
        revert NotImplemented();
    }

    function lockedBalanceOfAtSnapshotByPartition(bytes32, uint256, address) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getTotalTokenHoldersAtSnapshot(uint256) external pure returns (uint256) {
        revert NotImplemented();
    }

    function balanceOfAtSnapshot(uint256, address) external pure returns (uint256 balance_) {
        balance_ = 500;
    }

    function decimalsAtSnapshot(uint256) external pure returns (uint8 decimals_) {
        decimals_ = 2;
    }

    function totalSupplyAtSnapshot(uint256) external pure returns (uint256 totalSupply_) {
        totalSupply_ = 1000;
    }

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20(ERC20Metadata calldata) external pure {
        revert NotImplemented();
    }

    function transfer(address, uint256) external pure returns (bool) {
        revert NotImplemented();
    }

    function approve(address, uint256) external pure returns (bool) {
        revert NotImplemented();
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert NotImplemented();
    }

    function name() external pure returns (string memory) {
        revert NotImplemented();
    }

    function symbol() external pure returns (string memory) {
        revert NotImplemented();
    }

    function decimals() external pure returns (uint8) {
        revert NotImplemented();
    }

    function allowance(address, address) external pure returns (uint256) {
        revert NotImplemented();
    }

    function decimalsAt(uint256) external pure returns (uint8) {
        revert NotImplemented();
    }

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410_Basic(bool) external pure {
        revert NotImplemented();
    }

    function balanceOf(address) external pure returns (uint256) {
        return 120;
    }

    function balanceOfByPartition(bytes32, address) external pure returns (uint256) {
        revert NotImplemented();
    }

    function partitionsOf(address) external pure returns (bytes32[] memory) {
        revert NotImplemented();
    }

    function totalSupply() external pure returns (uint256) {
        revert NotImplemented();
    }

    function isMultiPartition() external pure returns (bool) {
        revert NotImplemented();
    }

    function totalSupplyByPartition(bytes32) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getCouponFromOrderedListAt(uint256) external pure returns (uint256) {
        revert NotImplemented();
    }

    function getCouponsOrderedList(uint256, uint256) external pure returns (uint256[] memory) {
        revert NotImplemented();
    }

    function getCouponsOrderedListTotal() external pure returns (uint256) {
        revert NotImplemented();
    }
}
