// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _ISIN_LENGTH,
    _CHECKSUM_POSITION_IN_ISIN,
    _TEN,
    _UINT_WITH_ONE_DIGIT,
    _ASCII_9,
    _ASCII_7,
    _ASCII_0
} from "../constants/values.sol";

/// @notice Thrown when the provided ISIN string does not have the expected 12-character length.
/// @param isin The invalid ISIN string that was supplied.
error WrongISIN(string isin);

/// @notice Thrown when the provided ISIN string has the correct length but fails the Luhn checksum.
/// @param isin The ISIN string whose checksum digit does not match the computed value.
error WrongISINChecksum(string isin);

/**
 * @notice Validates an ISIN string for both length conformance and ISO 6166 Luhn checksum.
 * @dev Entry point that sequentially delegates to `_checkLength` and `_checkChecksum`.
 *      Reverts with `WrongISIN` or `WrongISINChecksum` on the first failure encountered.
 * @param _isin The ISIN string to validate (must be exactly 12 characters).
 */
function _validateISIN(string calldata _isin) pure {
    _checkLength(_isin);
    _checkChecksum(_isin);
}

/**
 * @notice Reverts with `WrongISIN` when the ISIN byte length differs from `_ISIN_LENGTH` (12).
 * @param _isin The ISIN string to check.
 */
function _checkLength(string calldata _isin) pure {
    if (bytes(_isin).length != _ISIN_LENGTH) {
        revert WrongISIN(_isin);
    }
}

// solhint-disable-next-line max-line-length
// https://fastercapital.com/questions/how-to-check-if-an-isin-code-is-valid-and-compliant-with-the-iso-6166-standard.html
/**
 * @notice Reverts with `WrongISINChecksum` when the last character of the ISIN does not match
 *         the Luhn checksum computed from the preceding 11 characters.
 * @param _isin The 12-character ISIN string whose checksum digit is verified.
 */
function _checkChecksum(string calldata _isin) pure {
    bytes memory isin = bytes(_isin);
    (uint8[] memory conv, uint8 convLength) = _convertISINToNumber(isin);
    if (_byteToCode(isin[_CHECKSUM_POSITION_IN_ISIN]) != _calculateChecksum(conv, convLength)) {
        revert WrongISINChecksum(_isin);
    }
}

/**
 * @notice Converts the first `_CHECKSUM_POSITION_IN_ISIN` bytes of an ISIN to a flat digit
 *         array by expanding alphabetic characters into their two-digit numeric equivalents
 *         (A=10, B=11, … Z=35).
 * @dev Alphabetic characters whose code exceeds `_UINT_WITH_ONE_DIGIT` (9) produce two array
 *      entries (tens digit followed by units digit). The output array is pre-allocated to the
 *      maximum possible length (`_CHECKSUM_POSITION_IN_ISIN * 2`) and only `convLength_`
 *      entries are populated.
 * @param _isin The raw ISIN byte array.
 * @return conv_ Flat digit array used as input for the Luhn checksum.
 * @return convLength_ Number of valid entries written into `conv_`.
 */
function _convertISINToNumber(bytes memory _isin) pure returns (uint8[] memory conv_, uint8 convLength_) {
    unchecked {
        conv_ = new uint8[](_CHECKSUM_POSITION_IN_ISIN * 2);
        for (uint256 index; index < _CHECKSUM_POSITION_IN_ISIN; ++index) {
            uint8 code = _byteToCode(_isin[index]);
            if (code > _UINT_WITH_ONE_DIGIT) {
                conv_[convLength_] = code / _TEN;
                conv_[++convLength_] = code % _TEN; // Try with bitwise or &
            } else {
                conv_[convLength_] = code;
            }
            ++convLength_;
        }
    }
}

/**
 * @notice Computes the Luhn checksum digit for a digit array.
 * @dev Doubles every digit at an even distance from the right (pairing offset determined by
 *      `convLength`), sums the individual digits of results exceeding 9, then returns
 *      `(10 - (sum % 10)) % 10`.
 * @param _conv Flat digit array produced by `_convertISINToNumber`.
 * @param _convLength Number of valid entries in `_conv`.
 * @return checksum_ The single-digit Luhn checksum (0–9).
 */
function _calculateChecksum(uint8[] memory _conv, uint8 _convLength) pure returns (uint8 checksum_) {
    unchecked {
        uint256 pairing = (_convLength + 1) % 2;
        uint256 checksum;
        for (uint256 index; index < _convLength; ++index) {
            uint8 code = _conv[index] * ((index % 2) == pairing ? 2 : 1);
            if (code > _UINT_WITH_ONE_DIGIT) {
                checksum += code / _TEN;
                checksum += code % _TEN;
            } else {
                checksum += code;
            }
        }
        checksum_ = uint8((_TEN - (checksum % _TEN)) % _TEN);
    }
}

/**
 * @notice Converts a single ASCII byte to its numeric ISIN code.
 * @dev Digits `0`–`9` map to 0–9 (subtract `_ASCII_0`). Letters `A`–`Z` map to 10–35
 *      (subtract `_ASCII_7`, which equals `_ASCII_A - 10`).
 * @param _character ASCII byte representing a digit or uppercase letter.
 * @return code_ Numeric value (0–35) corresponding to `_character`.
 */
function _byteToCode(bytes1 _character) pure returns (uint8 code_) {
    code_ = uint8(_character);
    code_ = code_ > _ASCII_9 ? code_ - _ASCII_7 : code_ - _ASCII_0;
}
