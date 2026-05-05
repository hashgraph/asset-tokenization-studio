// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEIP712 } from "./IEIP712.sol";
import { ERC20PermitStorageWrapper } from "../../domain/asset/ERC20PermitStorageWrapper.sol";

/**
 * @title  EIP712
 * @notice Abstract implementation of `IEIP712`.
 * @dev    Delegates to `ERC20PermitStorageWrapper.DOMAIN_SEPARATOR()`, which computes
 *         the domain hash on every call using the token name, resolver-proxy version,
 *         chain ID, and diamond address.
 * @author Asset Tokenization Studio Team
 */
abstract contract EIP712 is IEIP712 {
    /// @inheritdoc IEIP712
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view override returns (bytes32 domainSeparator_) {
        domainSeparator_ = ERC20PermitStorageWrapper.DOMAIN_SEPARATOR();
    }
}
