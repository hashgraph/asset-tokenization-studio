// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IBeneficiaries {
    event BeneficiaryAdded(
        address indexed operator,
        address indexed beneficiary,
        bytes data
    );

    event BeneficiaryRemoved(
        address indexed operator,
        address indexed beneficiary
    );

    event BeneficiaryDataUpdated(
        address indexed operator,
        address indexed beneficiary,
        bytes newData
    );

    error BeneficiaryAlreadyExists(address beneficiary);
    error BeneficiaryNotFound(address beneficiary);

    /**
     * @notice Initializes the beneficiaries contract with a list of initial beneficiaries.
     * @param _beneficiaries An array of addresses representing the initial beneficiaries.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Beneficiaries(
        address[] calldata _beneficiaries,
        bytes[] calldata _data
    ) external;

    function addBeneficiary(
        address _beneficiary,
        bytes calldata _data
    ) external;

    function removeBeneficiary(address _beneficiary) external;

    function updateBeneficiaryData(
        address _beneficiary,
        bytes calldata _data
    ) external;

    function isBeneficiary(address _beneficiary) external view returns (bool);

    function getBeneficiaryData(
        address _beneficiary
    ) external view returns (bytes memory);

    function getBeneficiariesCount() external view returns (uint256);

    function getBeneficiaries(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory beneficiaries_);
}
