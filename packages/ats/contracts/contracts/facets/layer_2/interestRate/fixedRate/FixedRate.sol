// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFixedRate } from "./IFixedRate.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { EvmAccessors } from "../../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title  FixedRate
 * @notice Facet implementing a fixed interest rate for bond instruments, supporting
 *         one-time initialisation and authorised rate updates.
 * @dev    Implements `IFixedRate` and inherits `Modifiers` for access control and pause
 *         guards. All interest rate state is delegated to `InterestRateStorageWrapper`,
 *         which persists data via the ERC-2535 Diamond Storage Pattern.
 *
 *         Initialisation is protected by the `onlyNotFixedRateInitialized` modifier,
 *         ensuring it can only be called once per diamond proxy. Subsequent rate updates
 *         require the caller to hold `_INTEREST_RATE_MANAGER_ROLE` and the contract to
 *         be unpaused.
 * @author Hashgraph
 */
contract FixedRate is IFixedRate, Modifiers {
    /**
     * @notice Initialises the fixed rate module with the provided rate configuration.
     * @dev    Protected by `onlyNotFixedRateInitialized`; reverts if the fixed rate
     *         subsystem has already been initialised. Delegates all state writes to
     *         `InterestRateStorageWrapper.initializeFixedRate`. Must be called before
     *         `setRate` or `getRate` are used in production flows.
     * @param _initData  Calldata struct containing the initial rate value and its
     *                   decimal precision.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_FixedRate(FixedRateData calldata _initData) external override onlyNotFixedRateInitialized {
        InterestRateStorageWrapper.initializeFixedRate(_initData);
    }

    /**
     * @notice Updates the stored fixed interest rate to the provided value and decimal
     *         precision.
     * @dev    Requires the caller to hold `_INTEREST_RATE_MANAGER_ROLE` and the contract
     *         to be unpaused. Delegates the state write to
     *         `InterestRateStorageWrapper.setRate`. No validation is applied to the rate
     *         value or decimals at this layer; callers are responsible for ensuring the
     *         provided values are economically meaningful.
     *         Emits: `IFixedRate.RateUpdated`.
     * @param _newRate          New interest rate value to store.
     * @param _newRateDecimals  Decimal precision of `_newRate`.
     */
    function setRate(
        uint256 _newRate,
        uint8 _newRateDecimals
    ) external override onlyUnpaused onlyRole(_INTEREST_RATE_MANAGER_ROLE) {
        InterestRateStorageWrapper.setRate(_newRate, _newRateDecimals);
        emit RateUpdated(EvmAccessors.getMsgSender(), _newRate, _newRateDecimals);
    }

    /**
     * @notice Returns the currently stored fixed interest rate and its decimal precision.
     * @dev    Delegates entirely to `InterestRateStorageWrapper.getRate`. Returns
     *         zero values if the fixed rate module has not yet been initialised.
     * @return rate_      Current fixed interest rate value.
     * @return decimals_  Decimal precision of the returned rate.
     */
    function getRate() external view override returns (uint256 rate_, uint8 decimals_) {
        return InterestRateStorageWrapper.getRate();
    }
}
