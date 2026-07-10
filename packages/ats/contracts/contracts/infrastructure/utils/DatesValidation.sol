// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../errors/ICommonErrors.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title Dates Validation
 * @author Asset Tokenization Studio Team
 * @notice Utility library for dates validation
 */
library DatesValidation {
    function checkFutureTimestamp(uint256 _timestamp) internal view {
        if (_timestamp <= TimeTravelStorageWrapper.getBlockTimestamp()) revert ICommonErrors.WrongTimestamp(_timestamp);
    }

    function checkDates(uint256 _firstDate, uint256 _secondDate) internal pure {
        if (_secondDate < _firstDate) {
            revert ICommonErrors.WrongDates(_firstDate, _secondDate);
        }
    }

    function checkValidDates(uint256 _validFrom, uint256 _validTo, uint256 _timestamp) internal pure {
        if (_validFrom > _validTo || _validTo < _timestamp) revert ICommonErrors.InvalidDates();
    }

    function checkTimestamp(uint256 _timestamp) internal pure {
        if (_timestamp == 0) revert ICommonErrors.InvalidTimestamp();
    }
}
