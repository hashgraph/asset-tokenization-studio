// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Permit } from "../../ERC1400/ERC20Permit/IERC20Permit.sol";
import { IERC20 } from "../../ERC1400/ERC20/IERC20.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { ERC20PERMIT_TYPEHASH } from "../../../../constants/values.sol";
import { ERC712 } from "../../../../domain/core/ERC712.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { ControlListStorageWrapper } from "../../../../domain/core/ControlListStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../../domain/core/ComplianceStorageWrapper.sol";
import { NonceStorageWrapper } from "../../../../domain/core/NonceStorageWrapper.sol";
import { ERC20StorageWrapper } from "../../../../domain/asset/ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../../../infrastructure/proxy/ResolverProxyStorageWrapper.sol";

abstract contract ERC20Permit is IERC20Permit {
    // ═══════════════════════════════════════════════════════════════════════════════
    // EXTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireValidAddress(owner);
        ERC1410StorageWrapper.requireValidAddress(spender);
        ControlListStorageWrapper.requireListedAllowed(owner);
        ControlListStorageWrapper.requireListedAllowed(spender);
        ComplianceStorageWrapper.requireNotRecovered(owner);
        ComplianceStorageWrapper.requireNotRecovered(spender);
        ERC1410StorageWrapper.checkWithoutMultiPartition();

        _permit(owner, spender, value, deadline, v, r, s);
    }

    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view override returns (bytes32) {
        return _domainSeparator();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) private {
        if (deadline < block.timestamp) {
            revert IERC20Permit.ERC2612ExpiredSignature(deadline);
        }

        uint256 currentNonce = NonceStorageWrapper.getNonceFor(owner);

        bytes32 structHash = keccak256(abi.encode(ERC20PERMIT_TYPEHASH, owner, spender, value, currentNonce, deadline));
        NonceStorageWrapper.setNonceFor(currentNonce + 1, owner);
        address signer = ECDSA.recover(ECDSA.toTypedDataHash(_domainSeparator(), structHash), v, r, s);

        if (signer != owner) {
            revert IERC20Permit.ERC2612InvalidSigner(signer, owner);
        }

        assert(owner != address(0));
        if (spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }
        ERC20StorageWrapper.setAllowance(owner, spender, value);
        emit IERC20.Approval(owner, spender, value);
    }

    function _domainSeparator() private view returns (bytes32) {
        return
            ERC712.getDomainHash(
                ERC20StorageWrapper.getName(),
                Strings.toString(ResolverProxyStorageWrapper.getVersion()),
                block.chainid,
                address(this)
            );
    }
}
