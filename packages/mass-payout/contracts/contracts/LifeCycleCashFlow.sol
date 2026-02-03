// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.22;

// solhint-disable max-line-length

import { ILifeCycleCashFlow } from "./interfaces/ILifeCycleCashFlow.sol";
import { LifeCycleCashFlowStorageWrapper } from "./LifeCycleCashFlowStorageWrapper.sol";
import { IERC20 } from "@hashgraph/asset-tokenization-contracts/contracts/layer_1/interfaces/ERC1400/IERC20.sol";
import { IERC20 as OZ_IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { _PAYOUT_ROLE, _CASHOUT_ROLE, _TRANSFERER_ROLE, _PAYMENT_TOKEN_MANAGER_ROLE } from "./constants/roles.sol";

contract LifeCycleCashFlow is Initializable, LifeCycleCashFlowStorageWrapper {
    function initialize(
        address _asset,
        address _paymentToken,
        Rbac[] memory _rbac
    ) public initializer onlyValidPaymentToken(_paymentToken) {
        _setAsset(_asset);
        _setAssetType(ILifeCycleCashFlow.AssetType(uint8(IERC20(_asset).getERC20Metadata().securityType)));
        _updatePaymentToken(_paymentToken);
        _assignRbacRoles(_rbac);
    }

    /*
     * @dev Pay a coupon or dividend to a page of holders
     *
     * @param asset The address of the asset that the coupon/dividend belongs to
     * @param distributionID The coupon/dividend identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLength The number of holders who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     * @return True if ATS returns holders to be paid, and false otherwise
     */
    function executeDistribution(
        address _asset,
        uint256 _distributionID,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        override
        onlyUnpaused
        onlyRole(_PAYOUT_ROLE)
        isAsset(_asset)
        onlyOnDistributionDate(_asset, _distributionID)
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_, bool executed_)
    {
        (failed_, succeeded_, paidAmount_, executed_) = _executeDistribution(
            _lifeCycleCashFlowStorage().assetType,
            _lifeCycleCashFlowStorage().asset,
            _distributionID,
            _pageIndex,
            _pageLength
        );

        emit DistributionExecuted(_distributionID, _pageIndex, _pageLength, failed_, succeeded_, paidAmount_);
    }

    /*
     * @dev Retry the payment of a coupon or dividend to a list of holders
     *
     * @param asset The address of the asset that the coupon/dividend belongs to
     * @param distributionID The coupon/dividend identifier
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executeDistributionByAddresses(
        address _asset,
        uint256 _distributionID,
        address[] calldata _holders
    )
        external
        override
        onlyUnpaused
        onlyRole(_PAYOUT_ROLE)
        isAsset(_asset)
        onlyOnDistributionDate(_asset, _distributionID)
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_)
    {
        (failed_, succeeded_, paidAmount_) = _executeDistributionByAddresses(
            _lifeCycleCashFlowStorage().assetType,
            _lifeCycleCashFlowStorage().asset,
            _distributionID,
            _holders
        );

        emit DistributionByAddressesExecuted(_distributionID, _holders, failed_, succeeded_, paidAmount_);
    }

    /*
     * @dev Perform a bond cash out to a page of holders
     *
     * @param bond The address of the bond for the cash out to be performed
     * @param pageIndex The index of the page whose cash outs will be performed
     * @param pageLength The number of holders who owns the bond to be cashed out
     *
     * @return The array of the holders addresses whose cashes outs were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     * @return True if ATS returns holders for their bonds to be cashed out, and false otherwise
     */
    function executeBondCashOut(
        address _bond,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        override
        onlyUnpaused
        onlyRole(_CASHOUT_ROLE)
        isAsset(_bond)
        onlyOnMaturityDate(_bond)
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_, bool executed_)
    {
        (failed_, succeeded_, paidAmount_, executed_) = _executeBondCashOut(
            _lifeCycleCashFlowStorage().asset,
            _pageIndex,
            _pageLength
        );

        emit CashOutExecuted(_pageIndex, _pageLength, failed_, succeeded_, paidAmount_);
    }

    /*
     * @dev Perform a bond cash out to a list of holders
     *
     * @param bond The address of the bond for the cash out to be performed
     * @param holders The array of holders addresses who will be paid
     *
     * @return The array of the holders addresses whose cash outs were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executeBondCashOutByAddresses(
        address _bond,
        address[] calldata _holders
    )
        external
        override
        onlyUnpaused
        onlyRole(_CASHOUT_ROLE)
        isAsset(_bond)
        onlyOnMaturityDate(_bond)
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_)
    {
        (failed_, succeeded_, paidAmount_) = _executeBondCashOutByAddresses(_bond, _holders);

        emit CashOutByAddressesExecuted(_holders, failed_, succeeded_, paidAmount_);
    }

    /*
     * @dev Pay a fixed amount of USDC tokens to a page of holders
     *
     * @param asset The address of the asset that the snapshot belongs to
     * @param snapshotID The snapshot identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLength The number of holders who will be paid
     * @param amount The fixed amount to be paid distributed proportionally among the holders
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     * @return True if ATS returns holders to be paid, and false otherwise
     */
    function executeAmountSnapshot(
        address _asset,
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength,
        uint256 _amount
    )
        external
        onlyUnpaused
        onlyRole(_PAYOUT_ROLE)
        isAsset(_asset)
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_, bool executed_)
    {
        (failed_, succeeded_, paidAmount_, executed_) = _executeAmountSnapshot(
            _asset,
            _snapshotID,
            _pageIndex,
            _pageLength,
            _amount
        );

        emit AmountSnapshotExecuted(_snapshotID, _pageIndex, _pageLength, _amount, failed_, succeeded_, paidAmount_);
    }

    /*
     * @dev Pay a fixed amount of USDC tokens to a list of holders
     *
     * @param asset The address of the asset that the snapshot belongs to
     * @param snapshotID The snapshot identifier
     * @param pageIndex The index of the page whose holders will be paid
     * @param pageLength The number of holders who will be paid
     * @param percentage The contract balance percentage to be paid distributed proportionally among the holders
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executePercentageSnapshot(
        address _asset,
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength,
        uint256 _percentage
    )
        external
        onlyUnpaused
        onlyRole(_PAYOUT_ROLE)
        isAsset(_asset)
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_, bool executed_)
    {
        (failed_, succeeded_, paidAmount_, executed_) = _executePercentageSnapshot(
            _asset,
            _snapshotID,
            _pageIndex,
            _pageLength,
            _percentage
        );

        emit PercentageSnapshotExecuted(
            _snapshotID,
            _pageIndex,
            _pageLength,
            _percentage,
            failed_,
            succeeded_,
            paidAmount_
        );
    }

    /*
     * @dev Pay a fixed amount of USDC tokens to a page of holders
     *
     * @param asset The address of the asset that the snapshot belongs to
     * @param snapshotID The snapshot identifier
     * @param holders The array of holders addresses who will be paid * @param snapshotID The snapshot identifier
     * @param amount The fixed amount to be paid distributed proportionally among the holders
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executeAmountSnapshotByAddresses(
        address _asset,
        uint256 _snapshotID,
        address[] calldata _holders,
        uint256 _amount
    )
        external
        onlyUnpaused
        onlyRole(_PAYOUT_ROLE)
        isAsset(_asset)
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_)
    {
        (failed_, succeeded_, paidAmount_) = _executeSnapshotByAddresses(
            _asset,
            _snapshotID,
            _holders,
            _amount,
            _getSnapshotAmountByAmount
        );

        emit AmountSnapshotByAddressesExecuted(_snapshotID, _holders, _amount, failed_, succeeded_, paidAmount_);
    }

    /*
     * @dev Pay a fixed amount of USDC tokens to a list of holders
     *
     * @param asset The address of the asset that the snapshot belongs to
     * @param snapshotID The snapshot identifier
     * @param holders The array of holders addresses who will be paid
     * @param percentage The contract balance percentage to be paid distributed proportionally among the holders
     *
     * @return The array of the holders addresses whose payment were not successful
     * @return The array of the holders addresses whose payment were successful
     * @return The array of the amounts paid to holders
     */
    function executePercentageSnapshotByAddresses(
        address _asset,
        uint256 _snapshotID,
        address[] calldata _holders,
        uint256 _percentage
    )
        external
        onlyUnpaused
        onlyRole(_PAYOUT_ROLE)
        isAsset(_asset)
        returns (address[] memory failed_, address[] memory succeeded_, uint256[] memory paidAmount_)
    {
        (failed_, succeeded_, paidAmount_) = _executeSnapshotByAddresses(
            _asset,
            _snapshotID,
            _holders,
            _percentage,
            _getSnapshotAmountByPercentage
        );

        emit PercentageSnapshotByAddressesExecuted(
            _snapshotID,
            _holders,
            _percentage,
            failed_,
            succeeded_,
            paidAmount_
        );
    }

    /*
     * @dev Transfers an amount of payment tokens to an address
     *
     * @param to The destination of the amount of payment tokens
     * @param amount The amount of payment tokens to be transferred
     */
    function transferPaymentToken(address _to, uint256 _amount) external onlyUnpaused onlyRole(_TRANSFERER_ROLE) {
        _transferPaymentToken(_to, _amount);
        emit PaymentTokenTransferred(_to, _amount);
    }

    /*
     * @dev Set the payment token
     *
     * @param paymentToken The new payment token
     */
    function updatePaymentToken(
        address _paymentToken
    ) external onlyUnpaused onlyRole(_PAYMENT_TOKEN_MANAGER_ROLE) onlyValidPaymentToken(_paymentToken) {
        _updatePaymentToken(_paymentToken);
        emit PaymentTokenChanged(_paymentToken);
    }

    /*
     * @dev Get the payment token
     *
     * @returns The payment token
     */
    function getPaymentToken() external view returns (OZ_IERC20) {
        return _getPaymentToken();
    }

    /*
     * @dev Get the payment token decimals
     *
     * @returns The payment token decimals
     */
    function getPaymentTokenDecimals() external view returns (uint8) {
        return _getPaymentTokenDecimals();
    }
}
