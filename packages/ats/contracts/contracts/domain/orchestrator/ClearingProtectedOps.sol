// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingOps } from "./ClearingOps.sol";
import { IClearingTypes } from "../../facets/clearing/IClearingTypes.sol";
import { IHoldTypes } from "../../facets/hold/IHoldTypes.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1594StorageWrapper } from "../asset/ERC1594StorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";
import { _checkNonceAndDeadline } from "../../infrastructure/utils/EIP712.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title ClearingProtectedOps
 * @author Asset Tokenization Studio Team
 * @notice Library implementing the protected (EIP-712 signed) clearing operations.
 * @dev Deployed once and invoked via `delegatecall` from clearing facets. Every entry
 *      validates the nonce/deadline, verifies the off-chain signature against the
 *      protected-partitions registry, bumps the holder nonce, and dispatches into
 *      {ClearingOps} with the {ThirdPartyType.PROTECTED} dispatch tag. Extracted from
 *      {ClearingOps} to keep facet bytecode within EIP-170.
 */
library ClearingProtectedOps {
    /**
     * @notice Creates a protected clearing transfer authorised by the holder's EIP-712 signature.
     * @dev Reverts when the recovered address differs from `_protectedClearingOperation.from`,
     *      the nonce/deadline are invalid, or either party is currently in recovery.
     * @param _protectedClearingOperation Protected clearing envelope (partition, from, nonce, deadline, ...).
     * @param _amount The amount to clear for transfer.
     * @param _to The destination address that will receive the cleared transfer.
     * @param _signature The EIP-712 signature authorising the operation.
     * @return success_ True when the clearing entry was created.
     * @return clearingId_ Identifier assigned to the new clearing record.
     */
    function protectedClearingTransferByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_) {
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

        NonceStorageWrapper.setNonceFor(_protectedClearingOperation.from);

        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _protectedClearingOperation.clearingOperation,
            _amount,
            _to,
            _protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    /**
     * @notice Creates a protected clearing redeem authorised by the holder's EIP-712 signature.
     * @dev Reverts when the signature does not match, the nonce/deadline are invalid, or the
     *      holder is currently in recovery.
     * @param _protectedClearingOperation Protected clearing envelope (partition, from, nonce, deadline, ...).
     * @param _amount The amount to clear for redemption.
     * @param _signature The EIP-712 signature authorising the redemption.
     * @return success_ True when the clearing entry was created.
     * @return clearingId_ Identifier assigned to the new clearing record.
     */
    function protectedClearingRedeemByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_) {
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

        NonceStorageWrapper.setNonceFor(_protectedClearingOperation.from);

        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _protectedClearingOperation.clearingOperation,
            _amount,
            _protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    /**
     * @notice Creates a protected clearing hold-creation entry authorised by an EIP-712 signature.
     * @dev Reverts when the signature does not match, the nonce/deadline are invalid, or either
     *      the holder or hold recipient is currently in recovery.
     * @param _protectedClearingOperation Protected clearing envelope (partition, from, nonce, deadline, ...).
     * @param _hold The hold definition (escrow, recipient, expiration, amount, ...) to materialise on execute.
     * @param _signature The EIP-712 signature authorising the operation.
     * @return success_ True when the clearing entry was created.
     * @return clearingId_ Identifier assigned to the new clearing record.
     */
    function protectedClearingCreateHoldByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _signature
    ) external returns (bool success_, uint256 clearingId_) {
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

        NonceStorageWrapper.setNonceFor(_protectedClearingOperation.from);

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _protectedClearingOperation.clearingOperation,
            _protectedClearingOperation.from,
            _hold,
            "",
            ThirdPartyType.PROTECTED
        );
    }
}
