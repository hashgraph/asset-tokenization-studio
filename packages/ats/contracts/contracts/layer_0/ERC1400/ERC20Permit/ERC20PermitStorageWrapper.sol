// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20VotesStorageWrapper } from "../../ERC1400/ERC20Votes/ERC20VotesStorageWrapper.sol";
import { IERC20Permit } from "../../../layer_1/interfaces/ERC1400/IERC20Permit.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { ERC20PERMIT_TYPEHASH } from "../../constants/values.sol";
import { getDomainHash } from "../../../layer_0/common/libraries/ERC712Lib.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

abstract contract ERC20PermitStorageWrapper is ERC20VotesStorageWrapper {
    struct ERC20PermitStorage {
        // solhint-disable-next-line var-name-mixedcase
        string DEPRECATED_contractName;
        // solhint-disable-next-line var-name-mixedcase
        string DEPRECATED_contractVersion;
        // solhint-disable-next-line var-name-mixedcase
        bool DEPRECATED_initialized;
    }

    function _permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal override {
        if (_isExpired(deadline)) {
            revert IERC20Permit.ERC2612ExpiredSignature(deadline);
        }

        uint256 currentNonce = _getNonceFor(owner);

        bytes32 structHash = keccak256(abi.encode(ERC20PERMIT_TYPEHASH, owner, spender, value, currentNonce, deadline));
        _setNonceFor(currentNonce + 1, owner);
        address signer = ECDSA.recover(ECDSA.toTypedDataHash(_DOMAIN_SEPARATOR(), structHash), v, r, s);

        if (signer != owner) {
            revert IERC20Permit.ERC2612InvalidSigner(signer, owner);
        }
        _approve(owner, spender, value);
    }

    // solhint-disable-next-line func-name-mixedcase
    function _DOMAIN_SEPARATOR() internal view override returns (bytes32) {
        return getDomainHash(_getName(), Strings.toString(_getResolverProxyVersion()), _blockChainid(), address(this));
    }
}
