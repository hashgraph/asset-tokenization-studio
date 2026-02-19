// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable ordering

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";
import {
    HoldDataStorage,
    Hold,
    HoldData,
    HoldIdentifier,
    IHold
} from "../../facets/features/interfaces/hold/IHold.sol";
import { holdStorage } from "../../storage/AssetStorage.sol";
import { ThirdPartyType } from "../../facets/features/types/ThirdPartyType.sol";

/// @title LibHold
/// @notice Library for hold management logic
/// @dev Extracted from HoldStorageWrapper for library-based diamond migration
library LibHold {
    using LibPagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CREATION & LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Create a hold by partition
    /// @param _partition The partition identifier
    /// @param _from The token holder address
    /// @param _hold The hold details (amount, expiration, escrow, destination, data)
    /// @param _operatorData Additional operator data
    /// @param _thirdPartyType The type of third party (authorized/protected/other)
    /// @return holdId_ The newly created hold ID
    function createHold(
        bytes32 _partition,
        address _from,
        Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal returns (uint256 holdId_) {
        HoldDataStorage storage s = holdStorage();

        holdId_ = ++s.nextHoldIdByAccountAndPartition[_from][_partition];

        HoldData memory holdData = HoldData(holdId_, _hold, _operatorData, _thirdPartyType);
        s.holdsByAccountPartitionAndId[_from][_partition][holdId_] = holdData;
        s.holdIdsByAccountAndPartition[_from][_partition].add(holdId_);
        s.totalHeldAmountByAccountAndPartition[_from][_partition] += _hold.amount;
        s.totalHeldAmountByAccount[_from] += _hold.amount;
    }

    /// @notice Execute a hold by partition
    /// @param _holdIdentifier The hold identifier
    /// @param _amount The amount to execute
    /// @return holdData_ The updated hold data
    function executeHold(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (HoldData memory holdData_) {
        holdData_ = decreaseHeldAmount(_holdIdentifier, _amount);
        if (holdData_.hold.amount == 0) {
            removeHold(_holdIdentifier);
        }
    }

    /// @notice Release a hold by partition
    /// @param _holdIdentifier The hold identifier
    /// @param _amount The amount to release
    /// @return holdData_ The updated hold data
    function releaseHold(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (HoldData memory holdData_) {
        holdData_ = decreaseHeldAmount(_holdIdentifier, _amount);
        if (holdData_.hold.amount == 0) {
            removeHold(_holdIdentifier);
        }
    }

    /// @notice Reclaim a hold by partition
    /// @param _holdIdentifier The hold identifier
    /// @return amount_ The reclaimed amount
    function reclaimHold(HoldIdentifier calldata _holdIdentifier) internal returns (uint256 amount_) {
        HoldData memory holdData = getHold(_holdIdentifier);
        amount_ = holdData.hold.amount;

        decreaseHeldAmount(_holdIdentifier, amount_);
        removeHold(_holdIdentifier);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // BALANCE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Decrease the held amount and return updated hold data
    /// @param _holdIdentifier The hold identifier
    /// @param _amount The amount to decrease
    /// @return holdData_ The updated hold data
    function decreaseHeldAmount(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (HoldData memory holdData_) {
        HoldDataStorage storage s = holdStorage();

        s.totalHeldAmountByAccount[_holdIdentifier.tokenHolder] -= _amount;
        s.totalHeldAmountByAccountAndPartition[_holdIdentifier.tokenHolder][_holdIdentifier.partition] -= _amount;
        s
        .holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][_holdIdentifier.holdId]
            .hold
            .amount -= _amount;

        holdData_ = s.holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ];
    }

    /// @notice Update total held amounts with adjustment factor
    /// @param _tokenHolder The token holder address
    /// @param _factor The adjustment factor
    function updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor) internal {
        holdStorage().totalHeldAmountByAccount[_tokenHolder] *= _factor;
    }

    /// @notice Update partition-specific held amounts with adjustment factor
    /// @param _partition The partition identifier
    /// @param _tokenHolder The token holder address
    /// @param _factor The adjustment factor
    function updateTotalHeldAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor
    ) internal {
        holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
    }

    /// @notice Update hold amount by ID with adjustment factor
    /// @param _partition The partition identifier
    /// @param _holdId The hold ID
    /// @param _tokenHolder The token holder address
    /// @param _factor The adjustment factor
    function updateHoldAmountById(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _factor) internal {
        holdStorage().holdsByAccountPartitionAndId[_tokenHolder][_partition][_holdId].hold.amount *= _factor;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // HOLD REMOVAL
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Remove a hold completely
    /// @param _holdIdentifier The hold identifier
    function removeHold(HoldIdentifier calldata _holdIdentifier) internal {
        HoldDataStorage storage s = holdStorage();

        s.holdIdsByAccountAndPartition[_holdIdentifier.tokenHolder][_holdIdentifier.partition].remove(
            _holdIdentifier.holdId
        );

        delete s.holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ];

        delete s.holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // THIRD PARTY MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Set the third party for a hold
    /// @param _holdIdentifier The hold identifier
    /// @param _thirdParty The third party address
    function setHoldThirdParty(HoldIdentifier calldata _holdIdentifier, address _thirdParty) internal {
        holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ] = _thirdParty;
    }

    /// @notice Get the third party for a hold
    /// @param _holdIdentifier The hold identifier
    /// @return thirdParty_ The third party address
    function getHoldThirdParty(HoldIdentifier calldata _holdIdentifier) internal view returns (address thirdParty_) {
        thirdParty_ = holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // QUERIES - RETRIEVALS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get hold data by identifier
    /// @param _holdIdentifier The hold identifier
    /// @return holdData_ The hold data
    function getHold(HoldIdentifier memory _holdIdentifier) internal view returns (HoldData memory holdData_) {
        holdData_ = holdStorage().holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ];
    }

    /// @notice Get the total held amount for an account
    /// @param _tokenHolder The token holder address
    /// @return amount_ The total held amount
    function getHeldAmountFor(address _tokenHolder) internal view returns (uint256 amount_) {
        amount_ = holdStorage().totalHeldAmountByAccount[_tokenHolder];
    }

    /// @notice Get the held amount for an account by partition
    /// @param _partition The partition identifier
    /// @param _tokenHolder The token holder address
    /// @return amount_ The held amount by partition
    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256 amount_) {
        amount_ = holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    /// @notice Get hold IDs for an account and partition (paginated)
    /// @param _partition The partition identifier
    /// @param _tokenHolder The token holder address
    /// @param _pageIndex The page index
    /// @param _pageLength The page length
    /// @return holdsId_ Array of hold IDs
    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory holdsId_) {
        holdsId_ = holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].getFromSet(
            _pageIndex,
            _pageLength
        );
    }

    /// @notice Get detailed hold data by partition
    /// @param _holdIdentifier The hold identifier
    /// @return amount_ The hold amount
    /// @return expirationTimestamp_ The expiration timestamp
    /// @return escrow_ The escrow address
    /// @return destination_ The destination address
    /// @return data_ The hold data
    /// @return operatorData_ The operator data
    /// @return thirdPartyType_ The third party type
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
            ThirdPartyType thirdPartyType_
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

    /// @notice Get the hold count for an account by partition
    /// @param _partition The partition identifier
    /// @param _tokenHolder The token holder address
    /// @return count_ The hold count
    function getHoldCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256 count_) {
        count_ = holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].length();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // VALIDATION & CHECKS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Check if a hold ID is valid
    /// @param _holdIdentifier The hold identifier
    /// @return isValid_ True if hold ID is valid
    function isHoldIdValid(HoldIdentifier memory _holdIdentifier) internal view returns (bool isValid_) {
        isValid_ = getHold(_holdIdentifier).id != 0;
    }

    /// @notice Check if a hold is expired
    /// @param _hold The hold structure
    /// @param _blockTimestamp The current block timestamp
    /// @return isExpired_ True if hold is expired
    function isHoldExpired(Hold memory _hold, uint256 _blockTimestamp) internal pure returns (bool isExpired_) {
        isExpired_ = _blockTimestamp > _hold.expirationTimestamp;
    }

    /// @notice Check if an address is the escrow
    /// @param _hold The hold structure
    /// @param _escrow The escrow address to verify
    /// @return isEscrow_ True if address is escrow
    function isEscrow(Hold memory _hold, address _escrow) internal pure returns (bool isEscrow_) {
        isEscrow_ = _escrow == _hold.escrow;
    }

    /// @notice Validate a hold ID and revert if invalid
    /// @param _holdIdentifier The hold identifier
    function validateHoldId(HoldIdentifier calldata _holdIdentifier) internal view {
        if (!isHoldIdValid(_holdIdentifier)) revert IHold.WrongHoldId();
    }

    /// @notice Check if hold amount is sufficient
    /// @param _amount The amount to check
    /// @param _holdData The hold data
    function checkHoldAmount(uint256 _amount, HoldData memory _holdData) internal pure {
        if (_amount > _holdData.hold.amount) revert IHold.InsufficientHoldBalance(_holdData.hold.amount, _amount);
    }
}
