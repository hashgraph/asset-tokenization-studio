// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

// solhint-disable max-line-length

import { ILifeCycleCashFlow } from "./interfaces/ILifeCycleCashFlow.sol";
import {
    HederaTokenService
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import { Pause } from "./core/Pause.sol";
import { AccessControl } from "./core/AccessControl.sol";
import { IERC20 } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/ERC1400/IERC20.sol";
import { IERC20 as OZ_IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {
    ISnapshots
} from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/snapshots/ISnapshots.sol";
import { IBond } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBond.sol";
import { IBondRead } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/bond/IBondRead.sol";
import { IEquity } from "@hashgraph/asset-tokenization-contracts/contracts/layer_2/interfaces/equity/IEquity.sol";
import { ISecurity } from "@hashgraph/asset-tokenization-contracts/contracts/layer_3/interfaces/ISecurity.sol";
import { _PERCENTAGE_DECIMALS_SIZE } from "./constants/values.sol";
import { _LIFECYCLE_CASH_FLOW_STORAGE_POSITION } from "./constants/storagePositions.sol";

abstract contract LifeCycleCashFlowStorageWrapper is ILifeCycleCashFlow, HederaTokenService, Pause, AccessControl {
    using SafeERC20 for OZ_IERC20;

    struct LifeCycleCashFlowStorage {
        address asset;
        ILifeCycleCashFlow.AssetType assetType;
        OZ_IERC20 paymentToken;
        mapping(uint256 => mapping(address => bool)) paidAddressesByDistribution;
        mapping(uint256 => mapping(address => bool)) paidAddressesBySnapshot;
    }

    modifier isAsset(address _asset) {
        _checkAsset(_asset);
        _;
    }

    modifier onlyOnDistributionDate(address _asset, uint256 _distributionID) {
        _checkDistributionDate(_asset, _distributionID);
        _;
    }

    modifier onlyOnMaturityDate(address _bond) {
        _checkMaturityDate(_bond);
        _;
    }

    modifier onlyValidPaymentToken(address _paymentToken) {
        _checkPaymentToken(_paymentToken);
        _;
    }
    /*
     * @dev Pay a coupon or dividend to a list of holders
     *
     * @param assetType The type of the asset, bond/equity, the distribution belongs to
     * @param asset The asset the distribution belongs to
     * @param distributionID The coupon/dividend identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLength The number of holders who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     */
    function _executeDistribution(
        ILifeCycleCashFlow.AssetType _assetType,
        address _asset,
        uint256 _distributionID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_, bool) {
        address[] memory holders = _getHolders(_assetType, _asset, _distributionID, _pageIndex, _pageLength);
        if (holders.length == 0) return (failed_, succeeded_, paidAmount_, false);
        (failed_, succeeded_, paidAmount_) = _executeDistributionByAddresses(
            _assetType,
            _asset,
            _distributionID,
            holders
        );
        return (failed_, succeeded_, paidAmount_, true);
    }

    /*
     * @dev Retry the payment of a coupon or dividend to a list of holders
     *
     * @param assetType The type of the asset, bond/equity, the distribution belongs to
     * @param asset The asset the distribution belongs to
     * @param distributionID The coupon/dividend identifier
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     */
    function _executeDistributionByAddresses(
        ILifeCycleCashFlow.AssetType _assetType,
        address _asset,
        uint256 _distributionID,
        address[] memory _holders
    ) internal returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_) {
        address[] memory filteredHolders = _filterZeroAddresses(_holders);
        (failed_, succeeded_, paidAmount_) = _payHoldersDistribution(
            _assetType,
            _asset,
            _distributionID,
            filteredHolders
        );
    }
    /*
     * @dev Perform a bond cash out to a page of holders
     *
     * @param bond The bond the cash out belongs to
     * @param pageIndex The index of the page whose cash outs will be performed
     * @param pageLength The number of holders who owns the bond to be cashed out
     *
     * @return The array of the holders addresses whose cashes outs were not successful
     * @return True if ATS returns holders for their bonds to be cashed out, and false otherwise
     */
    function _executeBondCashOut(
        address _bond,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_, bool) {
        address[] memory holders = ISecurity(_bond).getSecurityHolders(_pageIndex, _pageLength);

        if (holders.length == 0) return (failed_, succeeded_, paidAmount_, false);
        (failed_, succeeded_, paidAmount_) = _executeBondCashOutByAddresses(_bond, holders);
        return (failed_, succeeded_, paidAmount_, true);
    }

    /*
     * @dev Perform a bond cash out to a list of holders
     *
     * @param bond The bond the cash out belongs to
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose cash outs were not successful
     */
    function _executeBondCashOutByAddresses(
        address _bond,
        address[] memory _holders
    ) internal returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_) {
        address[] memory filteredHolders = _filterZeroAddresses(_holders);
        (failed_, succeeded_, paidAmount_) = _payHoldersCashOut(_bond, filteredHolders);
    }

    /*
     * @dev Pay a fixed amount of USDC tokens to a page of holders
     *
     * @param asset The asset the snapshot belongs to
     * @param snapshotID The snapshot identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLength The number of holders who will be paid
     * @param amount The fixed amount to be paid distributed proportionally among the holders
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return True if ATS returns holders to be paid, and false otherwise
     */
    function _executeAmountSnapshot(
        address _asset,
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength,
        uint256 _amount
    )
        internal
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_, bool executed_)
    {
        address[] memory holders = _getHoldersBySnapshot(_asset, _snapshotID, _pageIndex, _pageLength);
        if (holders.length == 0) return (failed_, succeeded_, paidAmount_, false);
        (failed_, succeeded_, paidAmount_) = _executeSnapshotByAddresses(
            _asset,
            _snapshotID,
            holders,
            _amount,
            _getSnapshotAmountByAmount
        );
        return (failed_, succeeded_, paidAmount_, true);
    }

    /*
     * @dev Pay a fixed amount of USDC tokens to a list of holders
     *
     * @param asset The asset the snapshot belongs to
     * @param snapshotID The snapshot identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLength The number of holders who will be paid
     * @param percentage The contract balance percentage to be paid distributed proportionally among the holders
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return True if ATS returns holders to be paid, and false otherwise
     */
    function _executePercentageSnapshot(
        address _asset,
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength,
        uint256 _percentage
    )
        internal
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_, bool executed_)
    {
        if (_percentage > 100 * 10 ** _PERCENTAGE_DECIMALS_SIZE)
            revert ILifeCycleCashFlow.InvalidPercentage(_percentage);
        address[] memory holders = _getHoldersBySnapshot(_asset, _snapshotID, _pageIndex, _pageLength);
        if (holders.length == 0) return (failed_, succeeded_, paidAmount_, false);
        (failed_, succeeded_, paidAmount_) = _executeSnapshotByAddresses(
            _asset,
            _snapshotID,
            holders,
            _percentage,
            _getSnapshotAmountByPercentage
        );
        return (failed_, succeeded_, paidAmount_, true);
    }

    /*
     * @dev Pay an amount of USDC tokens, or a percentage of contract token balance, to a page of holders
     *
     * @param asset The asset the snapshot belongs to
     * @param snapshotID The snapshot identifier
     * @param holders The array of holders addresses who will be paid * @param snapshotID The snapshot identifier
     * @param amount The fixed amount to be paid distributed proportionally among the holders
     * @param getSnapshotAmount The function to calculate the amount of payment tokens to pay
     *
     * @return The array of the holders addresses whose payment were not successful
     */
    function _executeSnapshotByAddresses(
        address _asset,
        uint256 _snapshotID,
        address[] memory _holders,
        uint256 _amount,
        function(ILifeCycleCashFlow.SnapshotAmountInfo memory) internal returns (uint256) _getSnapshotAmount
    ) internal returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_) {
        address[] memory filteredHolders = _filterZeroAddresses(_holders);
        (failed_, succeeded_, paidAmount_) = _paySnapshotHolders(
            _asset,
            filteredHolders,
            _snapshotID,
            _amount,
            _getSnapshotAmount
        );
    }

    /*
     * @dev Transfers an amount of ERC20 tokens to an address
     *
     * @param to The destination of the amount of USDC tokens
     * @param amount The amount of USDC tokens to be transferred
     */
    function _transferPaymentToken(address _to, uint256 _amount) internal {
        OZ_IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;
        if (paymentToken.balanceOf(address(this)) < _amount) {
            revert ILifeCycleCashFlow.NotEnoughBalance(_amount);
        }

        if (!paymentToken.trySafeTransfer(_to, _amount)) {
            revert ILifeCycleCashFlow.TransferERC20TokenFailed(_to, _amount);
        }
    }

    /*
     * @dev Set a new payment token
     *
     * @param newPaymentToken The new payment token
     */
    function _updatePaymentToken(address _newPaymentToken) internal {
        _setPaymentToken(OZ_IERC20(_newPaymentToken));
        _associateToken(_newPaymentToken);
    }

    /*
     * @dev Set the asset
     *
     * @param asset The asset to be set
     */
    function _setAsset(address _asset) internal {
        _lifeCycleCashFlowStorage().asset = _asset;
    }

    /*
     * @dev Set the asset type
     *
     * @param assetType The asset type to be set
     */
    function _setAssetType(ILifeCycleCashFlow.AssetType _assetType) internal {
        _lifeCycleCashFlowStorage().assetType = _assetType;
    }

    /*
     * @dev Set the payment token
     *
     * @param token The payment token to be set
     */
    function _setPaymentToken(OZ_IERC20 token) internal {
        _lifeCycleCashFlowStorage().paymentToken = token;
    }

    /*
     * @dev Assign RBAC roles to members
     *
     * @param rbac The array of RBAC roles and members
     */
    function _assignRbacRoles(ILifeCycleCashFlow.Rbac[] memory _rbac) internal {
        for (uint256 rbacIndex; rbacIndex < _rbac.length; rbacIndex++) {
            for (uint256 memberIndex; memberIndex < _rbac[rbacIndex].members.length; memberIndex++) {
                _grantRole(_rbac[rbacIndex].role, _rbac[rbacIndex].members[memberIndex]);
            }
        }
    }

    /*
     * @dev Associate with payment token to the contract
     *
     * @param token The address of the token we want to associate with the contract
     */
    function _associateToken(address _token) internal virtual {
        if (HederaTokenService.associateToken(address(this), _token) != 22) {
            revert ILifeCycleCashFlow.AssociateTokenFailed();
        }

        emit TokenAssociated(_token);
    }

    /*
     * @dev Get snapshot amount to pay for a certain holder
     *
     * @param asset The asset the snapshot belongs to
     * @param snapshotID The snapshot identifier
     * @param holder The holder address to be paid´
     * @param amount The fixed amount to be paid distributed proportionally among the holders
     *
     * @return The amount to be paid
     */
    function _getSnapshotAmountByAmount(
        ILifeCycleCashFlow.SnapshotAmountInfo memory amountInfo
    ) internal view returns (uint256) {
        uint256 holderTokens = ISnapshots(amountInfo.asset).balanceOfAtSnapshot(
            amountInfo.snapshotID,
            amountInfo.holder
        );
        return ((amountInfo.amountOrPercentage * holderTokens) / amountInfo.totalSupplyAtSnapshot);
    }

    /*
     * @dev Get the snapshot amount to pay for a certain holder
     *
     * @param asset The asset the snapshot belongs to
     * @param snapshotID The coupon/dividend identifier
     * @param holder The holder address to be paid
     * @param percentage The contract balance percentage to be paid distributed proportionally among the holders
     *
     * @return The amount to be paid
     */
    function _getSnapshotAmountByPercentage(
        ILifeCycleCashFlow.SnapshotAmountInfo memory amountInfo
    ) internal view returns (uint256) {
        uint256 holderTokens = ISnapshots(amountInfo.asset).balanceOfAtSnapshot(
            amountInfo.snapshotID,
            amountInfo.holder
        );
        return ((amountInfo.paymentTokenBalance * amountInfo.amountOrPercentage * holderTokens) /
            ((100 * 10 ** _PERCENTAGE_DECIMALS_SIZE) * amountInfo.totalSupplyAtSnapshot));
    }

    /*
     * @dev Get the payment token
     *
     * @return The payment token
     */
    function _getPaymentToken() internal view returns (OZ_IERC20) {
        return _lifeCycleCashFlowStorage().paymentToken;
    }

    /*
     * @dev Get the payment token decimals
     *
     * @return The payment token decimals
     */
    function _getPaymentTokenDecimals() internal view returns (uint8) {
        return IERC20(address(_getPaymentToken())).decimals();
    }

    /*
     * @dev Checks if a distribution was already paid to a holder
     *
     * @param distributionID The coupon/dividend identifier
     * @param holder The holder to the if the distribution was already paid
     *
     * @return True if the distribution was already paid to the holder, false otherwise
     */
    function _isDistributionHolderPaid(uint256 _distributionID, address _holder) internal view returns (bool) {
        return _lifeCycleCashFlowStorage().paidAddressesByDistribution[_distributionID][_holder];
    }

    /*
     * @dev Checks if a snapshot was already paid to a holder
     *
     * @param snapshotID The snapshot identifier
     * @param holder The holder to the if the snapshot was already paid
     *
     * @return True if the snapshot was already paid to the holder, false otherwise
     */
    function _isSnapshotHolderPaid(uint256 _snapshotID, address _holder) internal view returns (bool) {
        return _lifeCycleCashFlowStorage().paidAddressesBySnapshot[_snapshotID][_holder];
    }

    /*
     * @dev Get the LifeCycleCashFlow storage
     *
     * @returns The LifeCycleCashFlow storage
     */
    function _lifeCycleCashFlowStorage()
        internal
        pure
        returns (LifeCycleCashFlowStorage storage lifeCycleCashFlowStorage_)
    {
        bytes32 position = _LIFECYCLE_CASH_FLOW_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            lifeCycleCashFlowStorage_.slot := position
        }
    }

    /*
     * @dev Sets a payment to a holder for a distribution
     *
     * @param distributionID The distribution paid to a holder
     * @param holder The holder who was paid
     */
    function _setDistributionHolderPaid(uint256 distributionID, address holder) private {
        _lifeCycleCashFlowStorage().paidAddressesByDistribution[distributionID][holder] = true;
    }

    /*
     * @dev Sets a payment to a holder for a snapshot
     *
     * @param snapshotID The snapshot paid to a holder
     * @param holder The holder who was paid
     */
    function _setSnapshotHolderPaid(uint256 snapshotID, address holder) private {
        _lifeCycleCashFlowStorage().paidAddressesBySnapshot[snapshotID][holder] = true;
    }

    /*
     * @dev Returns the array containing holders addresses who couldn't be paid for a distribution id
     *
     * @param assetType The type of the asset, bond/equity, the distribution belongs to
     * @param asset The asset the distribution belongs to
     * @param distributionID The coupon/dividend identifier
     * @param holders The holders to be paid
     *
     * @return The array of the holders addresses whose payment were not successful for the distribution
     */
    function _payHoldersDistribution(
        ILifeCycleCashFlow.AssetType _assetType,
        address _asset,
        uint256 _distributionID,
        address[] memory _holders
    )
        private
        returns (address[] memory failedAddresses_, address[] memory succeededAddresses_, uint256[] memory paidAmount_)
    {
        failedAddresses_ = new address[](_holders.length);
        succeededAddresses_ = new address[](_holders.length);
        paidAmount_ = new uint256[](_holders.length);
        OZ_IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;
        uint8 paymentTokenDecimals = _getPaymentTokenDecimals();

        uint256 failedIndex;
        uint256 succeededIndex;

        for (uint256 index; index < _holders.length; ) {
            address holder = _holders[index];

            if (_isDistributionHolderPaid(_distributionID, holder)) {
                failedAddresses_[failedIndex] = holder;
                unchecked {
                    ++failedIndex;
                    ++index;
                }
                continue;
            }

            uint256 amount = (_assetType == ILifeCycleCashFlow.AssetType.Bond)
                ? _getCouponAmount(_asset, _distributionID, holder, paymentTokenDecimals)
                : _getDividendAmount(_asset, _distributionID, holder, paymentTokenDecimals);

            if (!_payHolderDistribution(_distributionID, holder, amount, paymentToken)) {
                failedAddresses_[failedIndex] = holder;
                unchecked {
                    ++failedIndex;
                }
            } else {
                succeededAddresses_[succeededIndex] = holder;
                paidAmount_[succeededIndex] = amount;
                unchecked {
                    ++succeededIndex;
                }
            }

            unchecked {
                ++index;
            }
        }
        return (failedAddresses_, succeededAddresses_, paidAmount_);
    }

    /*
     * @dev Pay a snapshot to a list of holders
     *
     * @param asset The asset the snapshot belongs to
     * @param holders The holders to be paid
     * @param snapshotID The snapshot to be paid to the holders
     * @param amountOrPercentage The amount or percentage to be paid to the holders
     * @param getSnapshotAmount The function that calculates the amount to be paid to the holders
     *
     * @return The array of the holders addresses whose payment were not successful
     */
    function _paySnapshotHolders(
        address _asset,
        address[] memory _holders,
        uint256 _snapshotID,
        uint256 _amountOrPercentage,
        function(ILifeCycleCashFlow.SnapshotAmountInfo memory) internal returns (uint256) _getSnapshotAmount
    )
        private
        returns (address[] memory failedAddresses_, address[] memory succeededAddresses_, uint256[] memory paidAmount_)
    {
        failedAddresses_ = new address[](_holders.length);
        succeededAddresses_ = new address[](_holders.length);
        paidAmount_ = new uint256[](_holders.length);
        uint256 paymentTokenBalance = _lifeCycleCashFlowStorage().paymentToken.balanceOf(address(this));
        uint256 assetTotalSupply = _getTotalSupplyAtSnapshot(_asset, _snapshotID);

        uint256 failedIndex;
        uint256 succeededIndex;
        for (uint256 index; index < _holders.length; ) {
            address holder = _holders[index];
            if (_isSnapshotHolderPaid(_snapshotID, holder)) {
                failedAddresses_[failedIndex] = holder;
                unchecked {
                    ++failedIndex;
                    ++index;
                }
                continue;
            }

            ILifeCycleCashFlow.SnapshotAmountInfo memory amountInfo;
            amountInfo.asset = _asset;
            amountInfo.snapshotID = _snapshotID;
            amountInfo.holder = holder;
            amountInfo.amountOrPercentage = _amountOrPercentage;
            amountInfo.paymentTokenBalance = paymentTokenBalance;
            amountInfo.totalSupplyAtSnapshot = assetTotalSupply;
            uint256 amount = _getSnapshotAmount(amountInfo);

            if (!_paySnapshotHolder(_snapshotID, holder, amount, _lifeCycleCashFlowStorage().paymentToken)) {
                failedAddresses_[failedIndex] = holder;
                unchecked {
                    ++failedIndex;
                }
            } else {
                succeededAddresses_[succeededIndex] = holder;
                paidAmount_[succeededIndex] = amount;
                unchecked {
                    ++succeededIndex;
                }
            }

            unchecked {
                ++index;
            }
        }
        return (failedAddresses_, succeededAddresses_, paidAmount_);
    }

    /*
     * @dev Returns the array containing holders addresses who couldn't be paid for a cash out
     *
     * @param bond The bond the cash out belongs to
     * @param holders The holders to be paid
     *
     * @return The array of the holders addresses whose payment were not successful for the cash out
     */
    function _payHoldersCashOut(
        address _bond,
        address[] memory _holders
    )
        private
        returns (address[] memory failedAddresses_, address[] memory succeededAddresses_, uint256[] memory paidAmount_)
    {
        failedAddresses_ = new address[](_holders.length);
        succeededAddresses_ = new address[](_holders.length);
        paidAmount_ = new uint256[](_holders.length);
        OZ_IERC20 paymentToken = _lifeCycleCashFlowStorage().paymentToken;
        uint8 paymentTokenDecimals = _getPaymentTokenDecimals();

        uint256 failedIndex;
        uint256 succeededIndex;
        for (uint256 index; index < _holders.length; ) {
            address holder = _holders[index];
            uint256 cashAmount = _getCashOutAmount(_bond, holder, paymentTokenDecimals);

            if (!_payHolderCashOut(holder, cashAmount, paymentToken)) {
                failedAddresses_[failedIndex] = holder;
                unchecked {
                    ++failedIndex;
                }
            } else {
                IBond(_bond).fullRedeemAtMaturity(holder);
                succeededAddresses_[succeededIndex] = holder;
                paidAmount_[succeededIndex] = cashAmount;
                unchecked {
                    ++succeededIndex;
                }
            }

            unchecked {
                ++index;
            }
        }
    }

    /*
     * @dev Pay an amount of USDC tokens to a holder
     *
     * @param distributionID The coupon/dividend identifier
     * @param holder The holder address to be paid
     * @param amount The amount of erc20 tokens to be paid to the holder
     * @paymentToken The payment token used to pay the distribution
     *
     * @return True if the payment succeeded, false otherwise
     */
    function _payHolderDistribution(
        uint256 _distributionID,
        address _holder,
        uint256 _amount,
        OZ_IERC20 _paymentToken
    ) private returns (bool) {
        if (_paymentToken.balanceOf(address(this)) < _amount) {
            return false;
        }

        if (_amount == 0) {
            _setDistributionHolderPaid(_distributionID, _holder);
            return true;
        }

        if (_paymentToken.trySafeTransfer(_holder, _amount)) {
            _setDistributionHolderPaid(_distributionID, _holder);
            return true;
        }

        return false;
    }

    /*
     * @dev Pay an amount of payment tokens to a holder
     *
     * @param snapshot The snapshot identifier
     * @param holder The holder address to be paid
     * @param amount The amount of erc20 tokens to be paid to the holder
     * @paymentToken The payment token used to pay the snapshot
     *
     * @return True if the payment succeeded, false otherwise
     */
    function _paySnapshotHolder(
        uint256 _snapshotID,
        address _holder,
        uint256 _amount,
        OZ_IERC20 _paymentToken
    ) private returns (bool) {
        if (_paymentToken.balanceOf(address(this)) < _amount) {
            return false;
        }

        if (_amount == 0) {
            _setSnapshotHolderPaid(_snapshotID, _holder);
            return true;
        }

        if (_paymentToken.trySafeTransfer(_holder, _amount)) {
            _setSnapshotHolderPaid(_snapshotID, _holder);
            return true;
        }

        return false;
    }

    /*
     * @dev Pay an amount of payment tokens to a holder
     *
     * @param holder The holder address to be paid
     * @param amount The amount of erc20 tokens to be paid to the holder
     * @paymentToken The payment token used to pay the cash out
     *
     * @return True if the payment succeeded, false otherwise
     */
    function _payHolderCashOut(address _holder, uint256 _amount, OZ_IERC20 _paymentToken) private returns (bool) {
        if (_paymentToken.balanceOf(address(this)) < _amount) {
            return false;
        }

        if (_amount == 0) {
            return true;
        }

        return _paymentToken.trySafeTransfer(_holder, _amount);
    }

    /*
     * @dev Get a list of holders of a coupon/dividend by page
     *
     * @param assetType The type of the asset, bond/equity, to get the holders
     * @param asset The asset the holders belongs to
     * @param distributionID The coupon/dividend identifier
     * @param pageIndex The index of the page
     * @param pageLength The number of holders
     *
     * @return The array of the holders addresses
     */
    function _getHolders(
        ILifeCycleCashFlow.AssetType _assetType,
        address _asset,
        uint256 _distributionID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) private view returns (address[] memory holders_) {
        if (_assetType == ILifeCycleCashFlow.AssetType.Bond) {
            return IBondRead(_asset).getCouponHolders(_distributionID, _pageIndex, _pageLength);
        } else {
            return IEquity(_asset).getDividendHolders(_distributionID, _pageIndex, _pageLength);
        }
    }

    /*
     * @dev Get a list of holders of a snapshot
     *
     * @param asset The asset the snapshot belongs to
     * @param snapshotID The snapshot identifier
     * @param pageIndex The index of the page
     * @param pageLength The number of holders
     *
     * @return The array of the holders addresses
     */
    function _getHoldersBySnapshot(
        address _asset,
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) private view returns (address[] memory) {
        return ISnapshots(_asset).getTokenHoldersAtSnapshot(_snapshotID, _pageIndex, _pageLength);
    }

    /*
     * @dev Check that the contract manages a certain asset
     *
     * @param assetAddress The address of the asset to check
     */
    function _checkAsset(address _assetAddress) private view {
        if (_assetAddress != _lifeCycleCashFlowStorage().asset) {
            revert ILifeCycleCashFlow.InvalidAsset(_assetAddress);
        }
    }

    /*
     * @dev Check that today is the execution date of the distributionID
     *
     * @param asset The asset the distribution belongs to
     * @param distributionId The coupon or dividend identifier
     */
    function _checkDistributionDate(address _asset, uint256 _distributionID) private view {
        uint256 executionDateInit = _getDistributionExecutionDate(_asset, _distributionID);
        _checkPaymentDate(executionDateInit, _blockTimestamp());
    }

    /*
     * @dev Check that today is the maturity date of the bond
     *
     * @param bond The bond address
     */
    function _checkMaturityDate(address _bond) private view {
        uint256 maturityDateInit = IBondRead(_bond).getBondDetails().maturityDate;
        _checkPaymentDate(maturityDateInit, _blockTimestamp());
    }

    /*
     * @dev Get the asset total supply
     *
     * @param asset The asset its total supply is requested
     *
     * @return The asset total supply
     */
    function _getTotalSupplyAtSnapshot(address _asset, uint256 _snapshotID) private view returns (uint256) {
        return ISnapshots(_asset).totalSupplyAtSnapshot(_snapshotID);
    }

    /*
     * @dev Get the coupon amount to pay for a certain holder
     *
     * @param asset The asset its coupon amount is requested
     * @param couponId The coupon identifier
     * @param holder The holder address to be paid
     * @param bondDetailsData Bond details to calculate the amount
     *
     * @return True if getting coupon for was successfully executed, false otherwise
     * @return The amount to be paid
     */
    function _getCouponAmount(
        address _asset,
        uint256 _couponID,
        address _holder,
        uint8 _paymentTokenDecimals
    ) private view returns (uint256 amount) {
        IBondRead.CouponAmountFor memory couponAmountFor = IBondRead(_asset).getCouponAmountFor(_couponID, _holder);
        return (couponAmountFor.numerator * 10 ** _paymentTokenDecimals) / couponAmountFor.denominator;
    }

    /*
     * @dev Get the dividend amount to pay for a certain holder
     *
     * @param asset The asset the dividend amount is requested
     * @param dividendID The dividend identifier
     * @param holder The holder address to be paid
     *
     * @return True if getting dividends for was successfully executed, false otherwise
     * @return The amount to be paid
     */
    function _getDividendAmount(
        address _asset,
        uint256 _dividendID,
        address _holder,
        uint8 _paymentTokenDecimals
    ) private view returns (uint256) {
        IEquity.DividendAmountFor memory dividendAmountFor = IEquity(_asset).getDividendAmountFor(_dividendID, _holder);
        return (dividendAmountFor.numerator * 10 ** _paymentTokenDecimals) / dividendAmountFor.denominator;
    }

    /*
     * @dev Get the cash out amount to pay for a certain holder
     *
     * @param asset The asset its cash out amount is requested
     * @param holder The holder address to be paid
     *
     * @return The amount to be paid
     */
    function _getCashOutAmount(
        address _asset,
        address _holder,
        uint8 _paymentTokenDecimals
    ) private view returns (uint256) {
        IBondRead.PrincipalFor memory principalFor = IBondRead(_asset).getPrincipalFor(_holder);
        return (principalFor.numerator * 10 ** _paymentTokenDecimals) / principalFor.denominator;
    }

    /*
     * @dev Get the coupon or dividend execution date
     *
     * @param asset The asset its distribution execution date is requested
     * @param distributionID The identifier of the coupon or dividend
     *
     * @returns The coupon or dividend execution date
     */
    function _getDistributionExecutionDate(address _asset, uint256 _distributionID) private view returns (uint256) {
        return
            (_lifeCycleCashFlowStorage().assetType == ILifeCycleCashFlow.AssetType.Bond)
                ? IBondRead(_asset).getCoupon(_distributionID).coupon.executionDate
                : IEquity(_asset).getDividends(_distributionID).dividend.executionDate;
    }

    /*
     * @dev Check that the payment token is valid
     *
     * @param paymentToken The payment token address
     */
    function _checkPaymentToken(address _paymentToken) private pure {
        if (_paymentToken == address(0)) {
            revert ILifeCycleCashFlow.InvalidPaymentToken(_paymentToken);
        }
    }

    /*
     * @dev Check that today is the payment date of a distribution or a bond
     *
     * @param initialDate The payment initialDate
     * @param currentDate The current date
     *
     * @returns True if the the current date is between the initial and the ending date
     * @returns The payment ending date
     */
    function _checkPaymentDate(uint256 _initialDate, uint256 _currentDate) private pure {
        if (_currentDate < _initialDate) {
            revert ILifeCycleCashFlow.NotPaymentDate(_initialDate, _currentDate);
        }
    }

    /*
     * @dev Filter zero address addresses from an array of holders
     *
     * @param holders The holder's array
     *
     * @returns The array of holder's addresses without zero address addresses
     */
    function _filterZeroAddresses(address[] memory holders) private pure returns (address[] memory) {
        uint256 count;

        for (uint256 i = 0; i < holders.length; i++) {
            if (holders[i] != address(0)) {
                count++;
            }
        }

        address[] memory filtered = new address[](count);

        uint256 index;
        for (uint256 i = 0; i < holders.length; i++) {
            if (holders[i] != address(0)) {
                filtered[index] = holders[i];
                index++;
            }
        }

        return filtered;
    }
}
