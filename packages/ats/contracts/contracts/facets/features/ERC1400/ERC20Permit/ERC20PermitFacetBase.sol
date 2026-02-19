// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Permit } from "../../interfaces/ERC1400/IERC20Permit.sol";
import { IERC20StorageWrapper } from "../../interfaces/ERC1400/IERC20StorageWrapper.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { ERC20PERMIT_TYPEHASH } from "../../../../constants/values.sol";
import { getDomainHash } from "../../../../lib/core/ERC712.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibControlList } from "../../../../lib/core/LibControlList.sol";
import { LibCompliance } from "../../../../lib/core/LibCompliance.sol";
import { LibNonce } from "../../../../lib/core/LibNonce.sol";
import { LibERC20 } from "../../../../lib/domain/LibERC20.sol";
import { LibERC1410 } from "../../../../lib/domain/LibERC1410.sol";
import { LibResolverProxy } from "../../../../infrastructure/proxy/LibResolverProxy.sol";

abstract contract ERC20PermitFacetBase is IERC20Permit, IStaticFunctionSelectors {
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
        LibPause.requireNotPaused();
        LibERC1410.requireValidAddress(owner);
        LibERC1410.requireValidAddress(spender);
        LibControlList.requireListedAllowed(owner);
        LibControlList.requireListedAllowed(spender);
        LibCompliance.requireNotRecovered(owner);
        LibCompliance.requireNotRecovered(spender);
        LibERC1410.checkWithoutMultiPartition();

        _permit(owner, spender, value, deadline, v, r, s);
    }

    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view override returns (bytes32) {
        return _domainSeparator();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATIC FUNCTION SELECTORS
    // ═══════════════════════════════════════════════════════════════════════════════

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](2);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.permit.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.DOMAIN_SEPARATOR.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC20Permit).interfaceId;
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

        uint256 currentNonce = LibNonce.getNonceFor(owner);

        bytes32 structHash = keccak256(abi.encode(ERC20PERMIT_TYPEHASH, owner, spender, value, currentNonce, deadline));
        LibNonce.setNonceFor(currentNonce + 1, owner);
        address signer = ECDSA.recover(ECDSA.toTypedDataHash(_domainSeparator(), structHash), v, r, s);

        if (signer != owner) {
            revert IERC20Permit.ERC2612InvalidSigner(signer, owner);
        }

        assert(owner != address(0));
        if (spender == address(0)) {
            revert IERC20StorageWrapper.SpenderWithZeroAddress();
        }
        LibERC20.setAllowance(owner, spender, value);
        emit IERC20StorageWrapper.Approval(owner, spender, value);
    }

    function _domainSeparator() private view returns (bytes32) {
        return
            getDomainHash(
                LibERC20.getName(),
                Strings.toString(LibResolverProxy.getVersion()),
                block.chainid,
                address(this)
            );
    }
}
