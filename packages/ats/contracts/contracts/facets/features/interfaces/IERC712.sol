// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IERC712 {
    error WrongSignatureLength();
    error WrongNounce(uint256 nounce, address account);
    error ExpiredDeadline(uint256 deadline);
}
