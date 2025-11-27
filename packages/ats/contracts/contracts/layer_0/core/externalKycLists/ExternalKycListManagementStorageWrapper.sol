// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LibCommon } from "../../common/libraries/LibCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IExternalKycList } from "../../../layer_1/interfaces/externalKycLists/IExternalKycList.sol";
import { ExternalListManagementStorageWrapper } from "../externalLists/ExternalListManagementStorageWrapper.sol";
import { _KYC_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKyc } from "../../../layer_1/interfaces/kyc/IKyc.sol";

abstract contract ExternalKycListManagementStorageWrapper is ExternalListManagementStorageWrapper {
    using LibCommon for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    function _isExternallyGranted(address _account, IKyc.KycStatus _kycStatus) internal view returns (bool) {
        ExternalListDataStorage storage externalKycListStorage = _externalListStorage(_KYC_MANAGEMENT_STORAGE_POSITION);
        uint256 length = _getExternalListsCount(_KYC_MANAGEMENT_STORAGE_POSITION);
        for (uint256 index; index < length; ) {
            if (IExternalKycList(externalKycListStorage.list.at(index)).getKycStatus(_account) != _kycStatus)
                return false;
            unchecked {
                ++index;
            }
        }
        return true;
    }
}
