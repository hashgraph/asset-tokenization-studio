// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    TotalBalancesStorageWrapper
} from '../totalBalances/totalBalancesStorageWrapper.sol';
import {
    _BENEFICIARIES_STORAGE_POSITION,
    _BENEFICIARIES_DATA_STORAGE_POSITION
} from '../constants/storagePositions.sol';
import {
    IBeneficiaries
} from '../../layer_2/interfaces/beneficiaries/IBeneficiaries.sol';

abstract contract BeneficiariesStorageWrapper is TotalBalancesStorageWrapper {
    struct BeneficiariesDataStorage {
        mapping(address => bytes) beneficiaryData;
    }

    modifier onlyIfBeneficiary(address _beneficiary) {
        if (!_isExternalList(_BENEFICIARIES_STORAGE_POSITION, _beneficiary)) {
            revert IBeneficiaries.BeneficiaryNotFound(_beneficiary);
        }
        _;
    }

    modifier onlyIfNotBeneficiary(address _beneficiary) {
        if (_isExternalList(_BENEFICIARIES_STORAGE_POSITION, _beneficiary)) {
            revert IBeneficiaries.BeneficiaryAlreadyExists(_beneficiary);
        }
        _;
    }

    function _addBeneficiary(
        address _beneficiary,
        bytes calldata _data
    ) internal {
        _addExternalList(_BENEFICIARIES_STORAGE_POSITION, _beneficiary);
        _setBeneficiaryData(_beneficiary, _data);
    }

    function _removeBeneficiary(address _beneficiary) internal {
        _removeExternalList(_BENEFICIARIES_STORAGE_POSITION, _beneficiary);
        _removeBeneficiaryData(_beneficiary);
    }

    function _setBeneficiaryData(
        address _beneficiary,
        bytes calldata _data
    ) internal {
        _beneficiariesDataStorage().beneficiaryData[_beneficiary] = _data;
    }

    function _removeBeneficiaryData(address _beneficiary) internal {
        delete _beneficiariesDataStorage().beneficiaryData[_beneficiary];
    }

    function _getBeneficiaryData(
        address _beneficiary
    ) internal view returns (bytes memory) {
        return _beneficiariesDataStorage().beneficiaryData[_beneficiary];
    }

    function _beneficiariesDataStorage()
        internal
        pure
        returns (BeneficiariesDataStorage storage beneficiariesDataStorage_)
    {
        bytes32 position = _BENEFICIARIES_DATA_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            beneficiariesDataStorage_.slot := position
        }
    }
}
