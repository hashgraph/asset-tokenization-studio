// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/* solhint-disable */

import { _recoverSigner, _verify } from "../../infrastructure/utils/EIP712.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/**
 * @title MockEIP712
 * @author Asset Tokenization Studio Team
 * @notice Test-only contract that exposes the internal EIP-712 free functions for unit testing.
 * @dev Thin wrapper around `_recoverSigner` and `_verify` from `EIP712.sol`. Must never be
 *      deployed to production networks.
 */
contract MockEIP712 is ICommonErrors {
    /**
     * @notice Recovers the signer address from an EIP-712 prefixed hash and a raw signature.
     * @dev Delegates directly to the internal `_recoverSigner` free function.
     * @param _prefixedHash The EIP-712 prefixed message hash (i.e. the output of
     *        `ECDSA.toEthSignedMessageHash` or equivalent).
     * @param _signature The raw ECDSA signature bytes (65 bytes: r ++ s ++ v).
     * @return The address that produced `_signature` over `_prefixedHash`.
     */
    function exposed_recoverSigner(bytes32 _prefixedHash, bytes memory _signature) external pure returns (address) {
        return _recoverSigner(_prefixedHash, _signature);
    }

    /**
     * @notice Verifies that `_signer` produced the EIP-712 typed-data signature.
     * @dev Delegates directly to the internal `_verify` free function. The domain separator
     *      is reconstructed from `_contractName`, `_contractVersion`, `_chainid`, and
     *      `_contractAddress` on every call.
     * @param _signer          The address expected to have signed the typed data.
     * @param _functionHash    The hash of the EIP-712 typed-data struct.
     * @param _signature       The raw ECDSA signature bytes (65 bytes: r ++ s ++ v).
     * @param _contractName    The EIP-712 domain name of the originating contract.
     * @param _contractVersion The EIP-712 domain version of the originating contract.
     * @param _chainid         The chain ID used in the EIP-712 domain separator.
     * @param _contractAddress The address of the originating contract used in the domain
     *        separator.
     * @return True if the recovered signer matches `_signer`, false otherwise.
     */
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
