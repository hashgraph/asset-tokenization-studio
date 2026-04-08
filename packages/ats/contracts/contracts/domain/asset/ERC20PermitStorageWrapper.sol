// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Permit } from "../../facets/layer_1/ERC1400/ERC20Permit/IERC20Permit.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { ERC20PERMIT_TYPEHASH } from "../../constants/values.sol";
import { _getDomainHash } from "../../infrastructure/utils/ERC712.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../core/ResolverProxyStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

struct ERC20PermitStorage {
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    // solhint-disable-next-line var-name-mixedcase
    bool DEPRECATED_initialized;
}

library ERC20PermitStorageWrapper {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        if (TimeTravelStorageWrapper.getBlockTimestamp() > deadline) {
            revert IERC20Permit.ERC2612ExpiredSignature(deadline);
        }

        uint256 currentNonce = NonceStorageWrapper.getNonceFor(owner);

        bytes32 structHash = keccak256(abi.encode(ERC20PERMIT_TYPEHASH, owner, spender, value, currentNonce, deadline));
        NonceStorageWrapper.setNonceFor(currentNonce + 1, owner);
        // solhint-disable-next-line func-name-mixedcase
        address signer = ECDSA.recover(ECDSA.toTypedDataHash(DOMAIN_SEPARATOR(), structHash), v, r, s);

        if (signer != owner) {
            revert IERC20Permit.ERC2612InvalidSigner(signer, owner);
        }
        ERC20StorageWrapper.approve(owner, spender, value);
    }

    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() internal view returns (bytes32) {
        return
            _getDomainHash(
                ERC20StorageWrapper.getName(),
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                block.chainid,
                address(this)
            );
    }
}
