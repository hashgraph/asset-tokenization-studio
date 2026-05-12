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
    function initializeProceedRecipients(address[] calldata _proceedRecipients, bytes[] calldata _data) external;

    /**
     * @notice Marks the ProceedRecipients facet as ready following a Diamond upgrade.
     * @dev Called during upgrade re-initialisation. No storage migration is performed;
     *      existing state carries over unchanged. Reverts if the facet was not previously
     *      registered at one of the accepted config versions, or is already marked ready at
     *      the current config version.
     * @param fromVersions Accepted previous config versions for this upgrade path.
     */
    function reinitializeProceedRecipients(uint256[] calldata fromVersions) external;

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
