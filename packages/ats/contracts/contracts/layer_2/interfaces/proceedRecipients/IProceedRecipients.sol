// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IProceedRecipients {
    event ProceedRecipientAdded(address indexed operator, address indexed proceedRecipient, bytes data);

    event ProceedRecipientRemoved(address indexed operator, address indexed proceedRecipient);

    event ProceedRecipientDataUpdated(address indexed operator, address indexed proceedRecipient, bytes newData);

    error ProceedRecipientAlreadyExists(address proceedRecipient);
    error ProceedRecipientNotFound(address proceedRecipient);

    /**
     * @notice Initializes the proceedRecipients contract with a list of initial proceedRecipients.
     * @param _proceedRecipients An array of addresses representing the initial proceedRecipients.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProceedRecipients(address[] calldata _proceedRecipients, bytes[] calldata _data) external;

    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) external;

    function removeProceedRecipient(address _proceedRecipient) external;

    function updateProceedRecipientData(address _proceedRecipient, bytes calldata _data) external;

    function isProceedRecipient(address _proceedRecipient) external view returns (bool);

    function getProceedRecipientData(address _proceedRecipient) external view returns (bytes memory);

    function getProceedRecipientsCount() external view returns (uint256);

    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory proceedRecipients_);
}
