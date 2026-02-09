// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";

/// @title LibCompliance — KYC / compliance checks (22 lines of logic)
/// @notice Single responsibility: verify account compliance.
/// @dev No inheritance. No hidden dependencies.
library LibCompliance {
    error ComplianceNotMet(address account);

    function isCompliant(address account) internal view returns (bool) {
        return complianceStorage().compliant[account];
    }

    function requireCompliant(address account) internal view {
        if (!isCompliant(account)) revert ComplianceNotMet(account);
    }

    function setCompliant(address account, bool status) internal {
        complianceStorage().compliant[account] = status;
    }
}
