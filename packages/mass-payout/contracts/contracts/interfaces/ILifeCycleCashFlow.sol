// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ILifeCycleCashFlow {
    enum AssetType {
        Bond,
        Equity
    }

    struct Rbac {
        bytes32 role;
        address[] members;
    }

    struct SnapshotAmountInfo {
        address asset;
        uint256 snapshotID;
        address holder;
        uint256 amountOrPercentage;
        uint256 paymentTokenBalance;
        uint256 totalSupplyAtSnapshot;
    }

    /*
     * @dev Emitted when a coupon/dividend by page is executed
     *
     * @param distributionID The coupon/dividend identifier
     * @param pageIndex The page index
     * @param pageLength The page length
     * @param failed Holders addresses whose payments failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event DistributionExecuted(
        uint256 distributionID,
        uint256 pageIndex,
        uint256 pageLength,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a coupon/dividend by addresses is executed
     *
     * @param distributionID The coupon/dividend identifier
     * @param holders The holders addresses
     * @param failed Holders addresses whose payments failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event DistributionByAddressesExecuted(
        uint256 distributionID,
        address[] holders,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a cash out by page is executed
     *
     * @param pageIndex The page index
     * @param pageLength The page length
     * @param failed Holders addresses whose cash outs failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event CashOutExecuted(
        uint256 pageIndex,
        uint256 pageLength,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a cash out by addresses is executed
     *
     * @param holders The holders addresses
     * @param failed Holders addresses whose cash outs failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event CashOutByAddressesExecuted(address[] holders, address[] failed, address[] succceeded, uint256[] paidAmount);

    /*
     * @dev Emitted when the an amount of ERC20 token is transferred
     *
     * @param to The address for the ERC20 token to be transferred to
     * @param amount The amount of ERC20 to be transferred
     */
    event PaymentTokenTransferred(address to, uint256 amount);

    /*
     * @dev Emitted when the payment token is changed
     *
     * @param paymentToken The new payment token
     */
    event PaymentTokenChanged(address paymentToken);

    /*
     * @dev Emitted when an amount snapshot payment is executed
     *
     * @param snapshotID The snapshot identifier
     * @param pageIndex The page index
     * @param pageLength The page length
     * @param amount The payed total amount
     * @param failed Holders addresses whose payments failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event AmountSnapshotExecuted(
        uint256 snapshotID,
        uint256 pageIndex,
        uint256 pageLength,
        uint256 amount,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when an amount snapshot payment by addresses is executed
     *
     * @param snapshotID The snapshot identifier
     * @param holders The holders addresses
     * @param amount The payed total amount
     * @param failed Holders addresses whose payments failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event AmountSnapshotByAddressesExecuted(
        uint256 snapshotID,
        address[] holders,
        uint256 amount,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a percentage snapshot payment is executed
     *
     * @param snapshotID The snapshot identifier
     * @param pageIndex The page index
     * @param pageLength The page length
     * @param percentage The payed contract balance percentage
     * @param failed Holders addresses whose payments failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event PercentageSnapshotExecuted(
        uint256 snapshotID,
        uint256 pageIndex,
        uint256 pageLength,
        uint256 percentage,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a percentage snapshot payment by addresses is executed
     *
     * @param snapshotID The snapshot identifier
     * @param holders The holders addresses
     * @param percentage The payed contract balance percentage
     * @param failed Holders addresses whose payments failed
     * @param succeeded Holders addresses whose payments succeeded
     * @param paidAmount Amounts paid to succeeded holders
     */
    event PercentageSnapshotByAddressesExecuted(
        uint256 snapshotID,
        address[] holders,
        uint256 percentage,
        address[] failed,
        address[] succceeded,
        uint256[] paidAmount
    );

    /*
     * @dev Emitted when a token is associated with an account
     *
     * @param token The token the account is associated with
     */
    event TokenAssociated(address token);

    /**
     * @notice Error thrown when attempting to execute a payment for an asset not managed by the contract
     *
     * @param asset The address of the asset that is being tried to operate with
     */
    error InvalidAsset(address asset);

    /**
     * @notice Error thrown when attempting to execute a payment a date does not corresponds to the payment date
     * @param paymentDateInit The initial execution date
     * @param requestedDate The date a certain operation is requested to be made
     */
    error NotPaymentDate(uint256 paymentDateInit, uint256 requestedDate);

    /**
     * @notice Error thrown when the token association failed
     */
    error AssociateTokenFailed();

    /**
     * @notice Error thrown when a ERC20 token transfer fails
     * @param to The address for the ERC20 token to be transferred to
     * @param amount The amount of ERC20 token to be transferred
     */
    error TransferERC20TokenFailed(address to, uint256 amount);

    /**
     * @notice Error thrown when transfer an ERC20 token amount higher than the balance
     * @param amount The amount of ERC20 token to be transferred
     */
    error NotEnoughBalance(uint256 amount);

    /**
     * @notice Error thrown when percentage exceeds 100
     * @param percentage The percentage
     */
    error InvalidPercentage(uint256 percentage);

    /**
     * @notice Error thrown when the payment token to set is not valid
     * @param paymentToken The payment token
     */
    error InvalidPaymentToken(address paymentToken);

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
    ) external returns (address[] memory, address[] memory, uint256[] memory, bool);

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
    ) external returns (address[] memory, address[] memory, uint256[] memory);

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
    ) external returns (address[] memory, address[] memory, uint256[] memory, bool);

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
    ) external returns (address[] memory, address[] memory, uint256[] memory);

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
    ) external returns (address[] memory, address[] memory, uint256[] memory, bool);

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
    ) external returns (address[] memory, address[] memory, uint256[] memory, bool);

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
        uint256 _percentage
    ) external returns (address[] memory, address[] memory, uint256[] memory);

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
    ) external returns (address[] memory, address[] memory, uint256[] memory);

    /*
     * @dev Transfers an amount of ERC20 token tokens to an address
     *
     * @param to The destination of the amount of ERC20 token tokens
     * @param amount The amount of ERC20 token tokens to be transferred
     */
    function transferPaymentToken(address to, uint256 amount) external;

    /*
     * @dev Change the payment token
     *
     * @param paymentToken The new payment token
     */
    function updatePaymentToken(address paymentToken) external;

    /*
     * @dev Get the payment token
     *
     * @returns paymentToken The payment token
     */
    function getPaymentToken() external view returns (IERC20);

    /*
     * @dev Get the payment token decimals
     *
     * @returns The payment token decimals
     */
    function getPaymentTokenDecimals() external view returns (uint8);
}
