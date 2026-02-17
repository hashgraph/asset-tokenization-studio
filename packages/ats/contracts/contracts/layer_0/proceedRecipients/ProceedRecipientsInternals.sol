// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    SustainabilityPerformanceTargetRateInternals
} from "../interestRates/sustainabilityPerformanceTargetRate/SustainabilityPerformanceTargetRateInternals.sol";

abstract contract ProceedRecipientsInternals is SustainabilityPerformanceTargetRateInternals {
    function _addProceedRecipient(address _proceedRecipient, bytes calldata _data) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    ) internal virtual;
    function _removeProceedRecipient(address _proceedRecipient) internal virtual;
    function _removeProceedRecipientData(address _proceedRecipient) internal virtual;
    function _setProceedRecipientData(address _proceedRecipient, bytes calldata _data) internal virtual;
    function _getProceedRecipientData(address _proceedRecipient) internal view virtual returns (bytes memory);
    function _getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory proceedRecipients_);
    function _getProceedRecipientsCount() internal view virtual returns (uint256);
    function _isProceedRecipient(address _proceedRecipient) internal view virtual returns (bool);
    function _isProceedRecipientsInitialized() internal view virtual returns (bool);
}
