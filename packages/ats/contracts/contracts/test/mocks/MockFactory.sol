// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Factory } from "../../factory/Factory.sol";
import { ITimeTravel } from "../testTimeTravel/ITimeTravel.sol";

/**
 * @title Mock Factory
 * @notice Test factory that deploys securities and initialises their time-travel support.
 * @dev Extends `Factory` for test environments where deployed securities expose `ITimeTravel`.
 *      The deployed security must implement `initializeTimeTravel`, otherwise deployment reverts.
 * @author Asset Tokenization Studio Team
 */
abstract contract MockFactory is Factory {
    /// @inheritdoc Factory
    /// @dev Initialises time-travel state on the deployed security after the base deployment.
    function _deploySecurity(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal override returns (address securityAddress_) {
        securityAddress_ = super._deploySecurity(_securityData, _securityType);
        ITimeTravel(securityAddress_).initializeTimeTravel();
    }

    /// @inheritdoc Factory
    /// @dev Initialises time-travel state on the deployed deposit token after the base deployment.
    function _deployDepositToken(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal override returns (address securityAddress_) {
        securityAddress_ = super._deployDepositToken(_securityData, _securityType);
        ITimeTravel(securityAddress_).initializeTimeTravel();
    }
}
