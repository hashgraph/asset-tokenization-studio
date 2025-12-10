// SPDX-License-Identifier: Apache-2.0
// solhint-disable one-contract-per-file
pragma solidity >=0.8.0 <0.9.0;

import {
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";

interface IPrecompiledMock {
    function associateToken(address account, address token) external returns (int32 responseCode);
}

contract PrecompiledMockStorageWrapper {
    function _associateToken(address, address token) internal pure returns (int32 responseCode) {
        if (token == address(1)) {
            return HederaResponseCodes.UNKNOWN;
        }

        return HederaResponseCodes.SUCCESS;
    }
}

contract PrecompiledMock is IPrecompiledMock, PrecompiledMockStorageWrapper {
    function associateToken(address account, address token) external pure returns (int32 responseCode) {
        return _associateToken(account, token);
    }
}
