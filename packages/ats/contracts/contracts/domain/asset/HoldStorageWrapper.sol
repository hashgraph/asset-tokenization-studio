// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _HOLD_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    IHold,
    Hold,
    ProtectedHold,
    HoldIdentifier,
    HoldData,
    OperationType,
    HoldDataStorage
} from "../../facets/layer_1/hold/IHold.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Management } from "../../facets/layer_1/ERC3643/IERC3643Management.sol";
import { IERC20StorageWrapper } from "./ERC1400/ERC20/IERC20StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { IERC1410StorageWrapper } from "./ERC1400/ERC1410/IERC1410StorageWrapper.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { _checkNounceAndDeadline } from "../../infrastructure/utils/ERC712.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ControlListStorageWrapper } from "../core/ControlListStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

library HoldStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using LowLevelCall for address;

    // --- Create hold ---

    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal returns (bool success_, uint256 holdId_) {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _from, address(0));

        uint256 abaf = updateTotalHold(_partition, _from);

        beforeHold(_partition, _from);
        ERC1410StorageWrapper.reduceBalanceByPartition(_from, _hold.amount, _partition);

        HoldDataStorage storage holdStorageRef = holdStorage();

        holdId_ = ++holdStorageRef.nextHoldIdByAccountAndPartition[_from][_partition];

        HoldData memory hold = HoldData(holdId_, _hold, _operatorData, _thirdPartyType);
        AdjustBalancesStorageWrapper.setHeldLabafById(_partition, _from, holdId_, abaf);

        holdStorageRef.holdsByAccountPartitionAndId[_from][_partition][holdId_] = hold;
        holdStorageRef.holdIdsByAccountAndPartition[_from][_partition].add(holdId_);
        holdStorageRef.totalHeldAmountByAccountAndPartition[_from][_partition] += _hold.amount;
        holdStorageRef.totalHeldAmountByAccount[_from] += _hold.amount;

        emit IERC1410StorageWrapper.TransferByPartition(
            _partition,
            EvmAccessors.getMsgSender(),
            _from,
            address(0),
            _hold.amount,
            _operatorData,
            ""
        );
        emit IERC20StorageWrapper.Transfer(_from, address(0), _hold.amount);

        success_ = true;
    }

    // --- Protected create hold ---

    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal returns (bool success_, uint256 holdId_) {
        _checkNounceAndDeadline(
            _protectedHold.nonce,
            _from,
            NonceStorageWrapper.getNonceFor(_from),
            _protectedHold.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ProtectedPartitionsStorageWrapper.checkCreateHoldSignature(
            _partition,
            _from,
            _protectedHold,
            _signature,
            ERC20StorageWrapper.getName()
        );

        NonceStorageWrapper.setNonceFor(_protectedHold.nonce, _from);

        return createHoldByPartition(_partition, _from, _protectedHold.hold, "", ThirdPartyType.PROTECTED);
    }

    // --- Decrease allowance for hold ---

    function decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal {
        address thirdPartyAddress = EvmAccessors.getMsgSender();
        ERC20StorageWrapper.decreaseAllowedBalance(_from, thirdPartyAddress, _amount);
        holdStorage().holdThirdPartyByAccountPartitionAndId[_from][_partition][_holdId] = thirdPartyAddress;
    }

    // --- Execute hold ---

    function executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) internal returns (bool success_, bytes32 partition_) {
        beforeExecuteHold(_holdIdentifier, _to);

        success_ = operateHoldByPartition(_holdIdentifier, _to, _amount, OperationType.Execute);
        partition_ = _holdIdentifier.partition;

        HoldData memory holdData = getHold(_holdIdentifier);

        if (holdData.hold.amount == 0) {
            AdjustBalancesStorageWrapper.removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
    }

    // --- Release hold ---

    function releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (bool success_) {
        beforeReleaseHold(_holdIdentifier);

        HoldData memory holdData = getHold(_holdIdentifier);

        restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, _amount);

        success_ = operateHoldByPartition(_holdIdentifier, _holdIdentifier.tokenHolder, _amount, OperationType.Release);

        holdData = getHold(_holdIdentifier);

        if (holdData.hold.amount == 0) {
            AdjustBalancesStorageWrapper.removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
    }

    // --- Reclaim hold ---

    function reclaimHoldByPartition(
        HoldIdentifier calldata _holdIdentifier
    ) internal returns (bool success_, uint256 amount_) {
        beforeReclaimHold(_holdIdentifier);

        HoldData memory holdData = getHold(_holdIdentifier);
        amount_ = holdData.hold.amount;

        restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, amount_);

        success_ = operateHoldByPartition(_holdIdentifier, _holdIdentifier.tokenHolder, amount_, OperationType.Reclaim);

        AdjustBalancesStorageWrapper.removeLabafHold(
            _holdIdentifier.partition,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.holdId
        );
    }

    // --- Operate hold (core hold processing) ---

    function operateHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        OperationType _operation
    ) internal returns (bool success_) {
        HoldData memory holdData = getHold(_holdIdentifier);

        if (_operation == OperationType.Execute) {
            if (!ControlListStorageWrapper.isAbleToAccess(_holdIdentifier.tokenHolder)) {
                revert ControlListStorageWrapper.AccountIsBlocked(_holdIdentifier.tokenHolder);
            }

            if (holdData.hold.to != address(0) && _to != holdData.hold.to) {
                revert IHold.InvalidDestinationAddress(holdData.hold.to, _to);
            }
        }
        if (_operation != OperationType.Reclaim) {
            if (isHoldExpired(holdData.hold)) revert IHold.HoldExpirationReached();
            if (!isEscrow(holdData.hold, EvmAccessors.getMsgSender())) revert IHold.IsNotEscrow();
        } else if (_operation == OperationType.Reclaim && !isHoldExpired(holdData.hold)) {
            revert IHold.HoldExpirationNotReached();
        }

        checkHoldAmount(_amount, holdData);

        transferHold(_holdIdentifier, _to, _amount);

        success_ = true;
    }

    // --- Transfer hold to recipient ---

    function transferHold(HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal {
        if (decreaseHeldAmount(_holdIdentifier, _amount) == 0) {
            removeHold(_holdIdentifier);
        }
        if (ERC1410StorageWrapper.validPartitionForReceiver(_holdIdentifier.partition, _to)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(_to, _amount, _holdIdentifier.partition);
            if (_holdIdentifier.tokenHolder != _to && _holdIdentifier.partition == _DEFAULT_PARTITION) {
                (ERC3643StorageWrapper.erc3643Storage().compliance).functionCall(
                    abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
                    IERC3643Management.ComplianceCallFailed.selector
                );
            }
            emit IERC1410StorageWrapper.TransferByPartition(
                _holdIdentifier.partition,
                EvmAccessors.getMsgSender(),
                address(0),
                _to,
                _amount,
                "",
                ""
            );
            emit IERC20StorageWrapper.Transfer(address(0), _to, _amount);
            return;
        }
        ERC1410StorageWrapper.addPartitionTo(_amount, _to, _holdIdentifier.partition);
        if (_holdIdentifier.tokenHolder != _to && _holdIdentifier.partition == _DEFAULT_PARTITION) {
            (ERC3643StorageWrapper.erc3643Storage().compliance).functionCall(
                abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }
        emit IERC1410StorageWrapper.TransferByPartition(
            _holdIdentifier.partition,
            EvmAccessors.getMsgSender(),
            address(0),
            _to,
            _amount,
            "",
            ""
        );
        emit IERC20StorageWrapper.Transfer(address(0), _to, _amount);
    }

    // --- Hold amount operations ---

    function decreaseHeldAmount(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (uint256 newHoldBalance_) {
        HoldDataStorage storage holdStorageRef = holdStorage();

        holdStorageRef.totalHeldAmountByAccount[_holdIdentifier.tokenHolder] -= _amount;
        holdStorageRef.totalHeldAmountByAccountAndPartition[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ] -= _amount;
        holdStorageRef
        .holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][_holdIdentifier.holdId]
            .hold
            .amount -= _amount;

        newHoldBalance_ = holdStorageRef
        .holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][_holdIdentifier.holdId]
            .hold
            .amount;
    }

    // --- Remove hold ---

    function removeHold(HoldIdentifier calldata _holdIdentifier) internal {
        HoldDataStorage storage holdStorageRef = holdStorage();

        holdStorageRef.holdIdsByAccountAndPartition[_holdIdentifier.tokenHolder][_holdIdentifier.partition].remove(
            _holdIdentifier.holdId
        );

        delete holdStorageRef.holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ];

        delete holdStorageRef.holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];

        AdjustBalancesStorageWrapper.removeLabafHold(
            _holdIdentifier.partition,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.holdId
        );
    }

    // --- Update total hold balances ---

    function updateTotalHold(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper.getAbaf();

        uint256 labaf = AdjustBalancesStorageWrapper.getTotalHeldLabaf(_tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper.getTotalHeldLabafByPartition(_partition, _tokenHolder);

        if (abaf_ != labaf) {
            uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(abaf_, labaf);

            updateTotalHeldAmountAndLabaf(_tokenHolder, factor, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = AdjustBalancesStorageWrapper.calculateFactor(abaf_, labafByPartition);

            updateTotalHeldAmountAndLabafByPartition(_partition, _tokenHolder, factorByPartition, abaf_);
        }
    }

    function updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal {
        holdStorage().totalHeldAmountByAccount[_tokenHolder] *= _factor;
        AdjustBalancesStorageWrapper.setTotalHeldLabaf(_tokenHolder, _abaf);
    }

    function updateTotalHeldAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal {
        holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
        AdjustBalancesStorageWrapper.setTotalHeldLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    // --- Adjust hold balances ---

    function adjustHoldBalances(HoldIdentifier calldata _holdIdentifier, address _to) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _to);

        uint256 abaf = updateTotalHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder);

        updateHold(_holdIdentifier.partition, _holdIdentifier.holdId, _holdIdentifier.tokenHolder, abaf);
    }

    function updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) internal {
        uint256 holdLabaf = AdjustBalancesStorageWrapper.getHoldLabafById(_partition, _tokenHolder, _holdId);

        if (_abaf != holdLabaf) {
            uint256 holdFactor = AdjustBalancesStorageWrapper.calculateFactor(_abaf, holdLabaf);

            updateHoldAmountById(_partition, _holdId, _tokenHolder, holdFactor);
            AdjustBalancesStorageWrapper.setHeldLabafById(_partition, _tokenHolder, _holdId, _abaf);
        }
    }

    function updateHoldAmountById(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _factor) internal {
        HoldDataStorage storage holdStorageRef = holdStorage();

        holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][_partition][_holdId].hold.amount *= _factor;
    }

    // --- Before-hook callbacks ---

    function beforeHold(bytes32 _partition, address _tokenHolder) internal {
        SnapshotsStorageWrapper.updateAccountSnapshot(_tokenHolder, _partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(_tokenHolder, _partition);
    }

    function beforeExecuteHold(HoldIdentifier calldata _holdIdentifier, address _to) internal {
        adjustHoldBalances(_holdIdentifier, _to);
        SnapshotsStorageWrapper.updateAccountSnapshot(_to, _holdIdentifier.partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition
        );
    }

    function beforeReleaseHold(HoldIdentifier calldata _holdIdentifier) internal {
        beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    function beforeReclaimHold(HoldIdentifier calldata _holdIdentifier) internal {
        beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    // --- Adjusted-at queries ---

    function getHeldAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactorForHeldAmountByTokenHolderAdjustedAt(
            _tokenHolder,
            _timestamp
        );

        return getHeldAmountFor(_tokenHolder) * factor;
    }

    function getHeldAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 amount_) {
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper.getTotalHeldLabafByPartition(_partition, _tokenHolder)
        );
        return getHeldAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    // --- Hold ID validation and retrieval ---

    function requireValidHoldId(HoldIdentifier memory _holdIdentifier) internal view {
        if (!isHoldIdValid(_holdIdentifier)) revert IHold.WrongHoldId();
    }

    function isHoldIdValid(HoldIdentifier memory _holdIdentifier) internal view returns (bool) {
        return getHold(_holdIdentifier).id != 0;
    }

    function getHold(HoldIdentifier memory _holdIdentifier) internal view returns (HoldData memory) {
        return
            holdStorage().holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
                _holdIdentifier.holdId
            ];
    }

    // --- Hold amount queries ---

    function getHeldAmountFor(address _tokenHolder) internal view returns (uint256 amount_) {
        return holdStorage().totalHeldAmountByAccount[_tokenHolder];
    }

    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256 amount_) {
        return holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    // --- Hold pagination ---

    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory holdsId_) {
        return holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].getFromSet(_pageIndex, _pageLength);
    }

    // --- Hold details ---

    function getHoldForByPartition(
        HoldIdentifier calldata _holdIdentifier
    )
        internal
        view
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        )
    {
        HoldData memory holdData = getHold(_holdIdentifier);
        return (
            holdData.hold.amount,
            holdData.hold.expirationTimestamp,
            holdData.hold.escrow,
            holdData.hold.to,
            holdData.hold.data,
            holdData.operatorData,
            holdData.thirdPartyType
        );
    }

    function getHoldForByPartitionAdjustedAt(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _timestamp
    )
        internal
        view
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        )
    {
        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper.getHoldLabafById(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            )
        );

        (
            amount_,
            expirationTimestamp_,
            escrow_,
            destination_,
            data_,
            operatorData_,
            thirdPartType_
        ) = getHoldForByPartition(_holdIdentifier);
        amount_ *= factor;
    }

    function getHoldThirdParty(HoldIdentifier calldata _holdIdentifier) internal view returns (address thirdParty_) {
        HoldDataStorage storage holdStorageRef = holdStorage();

        thirdParty_ = holdStorageRef.holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];
    }

    // --- Hold count ---

    function getHoldCountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].length();
    }

    // --- Hold validation checks ---

    function isHoldExpired(Hold memory _hold) internal view returns (bool) {
        return TimeTravelStorageWrapper.getBlockTimestamp() > _hold.expirationTimestamp;
    }

    function isEscrow(Hold memory _hold, address _escrow) internal pure returns (bool) {
        return _escrow == _hold.escrow;
    }

    function checkHoldAmount(uint256 _amount, HoldData memory holdData) internal pure {
        if (_amount > holdData.hold.amount) revert IHold.InsufficientHoldBalance(holdData.hold.amount, _amount);
    }

    // --- Storage access ---

    function holdStorage() internal pure returns (HoldDataStorage storage hold_) {
        bytes32 position = _HOLD_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            hold_.slot := position
        }
    }

    // --- Private helper ---

    function restoreHoldAllowance(
        ThirdPartyType _thirdPartyType,
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) private {
        if (_thirdPartyType != ThirdPartyType.AUTHORIZED) return;
        ERC20StorageWrapper.increaseAllowedBalance(
            _holdIdentifier.tokenHolder,
            holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
                _holdIdentifier.holdId
            ],
            _amount
        );
    }
}
