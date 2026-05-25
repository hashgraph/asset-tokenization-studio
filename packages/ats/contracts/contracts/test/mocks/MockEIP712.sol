// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/* solhint-disable */

import { _recoverSigner, _verify } from "../../infrastructure/utils/EIP712.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/// @dev Test-only mock that exposes internal EIP712 free functions for unit testing.
contract MockEIP712 is ICommonErrors {
    function exposed_recoverSigner(bytes32 _prefixedHash, bytes memory _signature) external pure returns (address) {
        return _recoverSigner(_prefixedHash, _signature);
    }

    function exposed_verify(
        address _signer,
        bytes32 _functionHash,
        bytes memory _signature,
        string memory _contractName,
        string memory _contractVersion,
        uint256 _chainid,
        address _contractAddress
    ) external pure returns (bool) {
        return _verify(_signer, _functionHash, _signature, _contractName, _contractVersion, _chainid, _contractAddress);
    }
}

/* solhint-enable */
