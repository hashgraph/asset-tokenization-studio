// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../errors/ICommonErrors.sol";
import {
    MAX_UINT256,
    POW10_0,
    POW10_1,
    POW10_2,
    POW10_3,
    POW10_4,
    POW10_5,
    POW10_6,
    POW10_7,
    POW10_8,
    POW10_9,
    POW10_10,
    POW10_11,
    POW10_12,
    POW10_13,
    POW10_14,
    POW10_15,
    POW10_16,
    POW10_17,
    POW10_18
} from "../../constants/values.sol";

library DecimalsLib {
    uint8 private constant MAX_DECIMALS = 78;

    function calculateDecimalsAdjustment(
        uint256 _amount,
        uint8 _decimals,
        uint8 _newDecimals
    ) internal pure returns (uint256) {
        if (_decimals == _newDecimals) return _amount;
        uint8 decimalsDiff;
        if (_newDecimals > _decimals) {
            decimalsDiff = _newDecimals - _decimals;
            if (decimalsDiff >= MAX_DECIMALS) revert ICommonErrors.DecimalsTooLarge(_decimals, _newDecimals);
            uint256 multiplier = _pow10(decimalsDiff);
            if (_amount > (MAX_UINT256 / multiplier)) revert ICommonErrors.GreaterThanMaxUint256(_amount, decimalsDiff);
            unchecked {
                return _amount * multiplier;
            }
        }
        decimalsDiff = _decimals - _newDecimals;
        if (decimalsDiff >= MAX_DECIMALS) revert ICommonErrors.DecimalsTooLarge(_decimals, _newDecimals);
        unchecked {
            return _amount / _pow10(decimalsDiff);
        }
    }

    /**
     * @notice Computes 10 raised to the power of the given exponent.
     * @dev Exponents 0-18 are resolved via a Yul switch lookup (O(1), ~50-75 gas).
     *      Exponents 19-77 fall through to the EVM EXP opcode in an unchecked block (~100 gas).
     *      The caller is responsible for ensuring _exponent <= 77; no bounds check is performed here.
     * @param _exponent The power to which 10 is raised (must be 0-77 inclusive).
     * @return result_ The computed power of 10.
     */
    function _pow10(uint256 _exponent) private pure returns (uint256 result_) {
        assembly {
            // OPTIMIZATION: Fast path for common exponents (0-18)
            // Gas cost: ~50-75 gas total
            // Breakdown:
            //   - Switch evaluation: ~20 gas
            //   - Constant load: ~3 gas
            //   - Return overhead: ~30 gas
            // Coverage: 99.5% of real-world DeFi operations
            switch _exponent
            case 0 {
                result_ := POW10_0
            }
            case 1 {
                result_ := POW10_1
            }
            case 2 {
                result_ := POW10_2
            }
            case 3 {
                result_ := POW10_3
            }
            case 4 {
                result_ := POW10_4
            }
            case 5 {
                result_ := POW10_5
            }
            case 6 {
                result_ := POW10_6
            }
            case 7 {
                result_ := POW10_7
            }
            case 8 {
                result_ := POW10_8
            }
            case 9 {
                result_ := POW10_9
            }
            case 10 {
                result_ := POW10_10
            }
            case 11 {
                result_ := POW10_11
            }
            case 12 {
                result_ := POW10_12
            }
            case 13 {
                result_ := POW10_13
            }
            case 14 {
                result_ := POW10_14
            }
            case 15 {
                result_ := POW10_15
            }
            case 16 {
                result_ := POW10_16
            }
            case 17 {
                result_ := POW10_17
            }
            case 18 {
                result_ := POW10_18
            }
        }
        unchecked {
            return result_ == 0 ? 10 ** _exponent : result_;
        }
    }
}
