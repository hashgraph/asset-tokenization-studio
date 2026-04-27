// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingOps } from "./ClearingOps.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1594StorageWrapper } from "../asset/ERC1594StorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";
import { _checkNonceAndDeadline } from "../../infrastructure/utils/ERC712.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/// @title ClearingProtectedOps - Protected clearing operations with EIP-712 signatures
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL.
/// @dev Extracted from ClearingOps to reduce bytecode size.
library ClearingProtectedOps {
    function protectedClearingTransferByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        _checkNonceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ERC1594StorageWrapper.requireNotRecoveredAddresses(_protectedClearingOperation.from, _to);

        ProtectedPartitionsStorageWrapper.checkClearingTransferSignature(
            _protectedClearingOperation,
            _amount,
            _to,
            _signature,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);

        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _protectedClearingOperation.clearingOperation,
            _amount,
            _to,
            _protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function protectedClearingRedeemByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        _checkNonceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ERC1594StorageWrapper.requireNotRecoveredAddresses(_protectedClearingOperation.from, address(0));

        ProtectedPartitionsStorageWrapper.checkClearingRedeemSignature(
            _protectedClearingOperation,
            _amount,
            _signature,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);

        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _protectedClearingOperation.clearingOperation,
            _amount,
            _protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function protectedClearingCreateHoldByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        _checkNonceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ERC1594StorageWrapper.requireNotRecoveredAddresses(_protectedClearingOperation.from, _hold.to);

        ProtectedPartitionsStorageWrapper.checkClearingCreateHoldSignature(
            _protectedClearingOperation,
            _hold,
            _signature,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _protectedClearingOperation.clearingOperation,
            _protectedClearingOperation.from,
            _hold,
            "",
            ThirdPartyType.PROTECTED
        );
    }
}
