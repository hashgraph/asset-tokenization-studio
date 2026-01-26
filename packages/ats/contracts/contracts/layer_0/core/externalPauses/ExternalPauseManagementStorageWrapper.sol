// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListStorageWrapper } from "../controlList/ControlListStorageWrapper.sol";
import { LibCommon } from "../../common/libraries/LibCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IExternalPause } from "../../../layer_1/interfaces/externalPauses/IExternalPause.sol";
import { _PAUSE_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";

abstract contract ExternalPauseManagementStorageWrapper is ControlListStorageWrapper {
    using LibCommon for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ExternalPauses(address[] calldata _pauses) internal override {
        uint256 length = _pauses.length;
        for (uint256 index; index < length; ) {
            _checkValidAddress(_pauses[index]);
            _addExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pauses[index]);
            unchecked {
                ++index;
            }
        }
        _setExternalListInitialized(_PAUSE_MANAGEMENT_STORAGE_POSITION);
    }

    function _isExternallyPaused() internal view override returns (bool) {
        ExternalListDataStorage storage externalPauseDataStorage = _externalListStorage(
            _PAUSE_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = _getExternalListsCount(_PAUSE_MANAGEMENT_STORAGE_POSITION);

        for (uint256 index = 0; index < length; ) {
            if (IExternalPause(externalPauseDataStorage.list.at(index)).isPaused()) return true;
            unchecked {
                ++index;
            }
        }
        return false;
    }

    function _isExternalPauseInitialized() internal view override returns (bool) {
        return _externalListStorage(_PAUSE_MANAGEMENT_STORAGE_POSITION).initialized;
    }
}
