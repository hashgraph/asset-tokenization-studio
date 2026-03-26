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

error WrongISIN(string isin);
error WrongISINChecksum(string isin);

function validateISIN(string calldata _isin) pure {
    checkLength(_isin);
    checkChecksum(_isin);
}

function checkLength(string calldata _isin) pure {
    if (bytes(_isin).length != _ISIN_LENGTH) {
        revert WrongISIN(_isin);
    }
}

// solhint-disable-next-line max-line-length
// https://fastercapital.com/questions/how-to-check-if-an-isin-code-is-valid-and-compliant-with-the-iso-6166-standard.html
function checkChecksum(string calldata _isin) pure {
    bytes memory isin = bytes(_isin);
    (uint8[] memory conv, uint8 convLength) = convertISINToNumber(isin);
    if (byteToCode(isin[_CHECKSUM_POSITION_IN_ISIN]) != calculateChecksum(conv, convLength)) {
        revert WrongISINChecksum(_isin);
    }
}

function convertISINToNumber(bytes memory _isin) pure returns (uint8[] memory conv_, uint8 convLength_) {
    unchecked {
        conv_ = new uint8[](_CHECKSUM_POSITION_IN_ISIN * 2);
        for (uint256 index; index < _CHECKSUM_POSITION_IN_ISIN; ++index) {
            uint8 code = byteToCode(_isin[index]);
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

function calculateChecksum(uint8[] memory _conv, uint8 _convLength) pure returns (uint8 checksum_) {
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

function byteToCode(bytes1 _character) pure returns (uint8 code_) {
    code_ = uint8(_character);
    code_ = code_ > _ASCII_9 ? code_ - _ASCII_7 : code_ - _ASCII_0;
}
