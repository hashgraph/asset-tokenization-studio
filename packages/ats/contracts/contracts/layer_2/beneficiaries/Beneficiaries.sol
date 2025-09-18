// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {IBeneficiaries} from '../interfaces/beneficiaries/IBeneficiaries.sol';
import {Common} from '../../layer_1/common/Common.sol';
import {_BENEFICIARY_MANAGER_ROLE} from '../constants/roles.sol';
import {
    _BENEFICIARIES_STORAGE_POSITION
} from '../../layer_0/constants/storagePositions.sol';

contract Beneficiaries is IBeneficiaries, Common {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Beneficiaries(
        address[] calldata _beneficiaries,
        bytes[] calldata _data
    )
        external
        override
        onlyUninitialized(
            _externalListStorage(_BENEFICIARIES_STORAGE_POSITION).initialized
        )
    {
        uint256 length = _beneficiaries.length;
        for (uint256 index; index < length; ) {
            _addExternalList(
                _BENEFICIARIES_STORAGE_POSITION,
                _beneficiaries[index]
            );
            _setBeneficiaryData(_beneficiaries[index], _data[index]);
            unchecked {
                ++index;
            }
        }

        _externalListStorage(_BENEFICIARIES_STORAGE_POSITION)
            .initialized = true;
    }

    function addBeneficiary(
        address _beneficiary,
        bytes calldata _data
    )
        external
        override
        onlyUnpaused
        onlyRole(_BENEFICIARY_MANAGER_ROLE)
        onlyIfNotBeneficiary(_beneficiary)
    {
        _addBeneficiary(_beneficiary, _data);
        emit BeneficiaryAdded(_msgSender(), _beneficiary, _data);
    }

    function removeBeneficiary(
        address _beneficiary
    )
        external
        override
        onlyUnpaused
        onlyRole(_BENEFICIARY_MANAGER_ROLE)
        onlyIfBeneficiary(_beneficiary)
    {
        _removeBeneficiary(_beneficiary);
        emit BeneficiaryRemoved(_msgSender(), _beneficiary);
    }

    function updateBeneficiaryData(
        address _beneficiary,
        bytes calldata _data
    )
        external
        override
        onlyUnpaused
        onlyRole(_BENEFICIARY_MANAGER_ROLE)
        onlyIfBeneficiary(_beneficiary)
    {
        _setBeneficiaryData(_beneficiary, _data);
        emit BeneficiaryDataUpdated(_msgSender(), _beneficiary, _data);
    }

    function isBeneficiary(
        address _beneficiary
    ) external view override returns (bool) {
        return _isExternalList(_BENEFICIARIES_STORAGE_POSITION, _beneficiary);
    }

    function getBeneficiaryData(
        address _beneficiary
    ) external view override returns (bytes memory) {
        return _getBeneficiaryData(_beneficiary);
    }

    function getBeneficiariesCount() external view override returns (uint256) {
        return _getExternalListsCount(_BENEFICIARIES_STORAGE_POSITION);
    }

    function getBeneficiaries(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory beneficiaries_) {
        return
            _getExternalListsMembers(
                _BENEFICIARIES_STORAGE_POSITION,
                _pageIndex,
                _pageLength
            );
    }
}
