// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey ProceedRecipients
bytes32 constant RESOLVER_KEY_PROCEED_RECIPIENTS = 0x63388aa198df5944c611b8fcbfd32945c57864f7125a5f95069040087d2b0bb7;

/// @custom:hash resolverKey ProceedRecipientsKpiLinkedRate
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_PROCEED_RECIPIENTS_KPI_LINKED_RATE = 0x0e3f0300490c976e8984dcc9a9d086f30a32e8112eea1fd40457bd63404feb42;

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
