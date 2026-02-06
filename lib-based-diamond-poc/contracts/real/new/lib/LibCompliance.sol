// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../storage/ERC1410Storage.sol";

/**
 * NEW ARCHITECTURE - LibCompliance
 *
 * ONLY compliance-related logic.
 * Single responsibility. Easy to find. Easy to audit.
 */
library LibCompliance {
    error ComplianceNotMet(address from, address to);

    function checkCompliance(address from, address to) internal view {
        ComplianceStorage storage cs = complianceStorage();
        if (cs.complianceEnabled) {
            if (!cs.compliant[from] || !cs.compliant[to]) {
                revert ComplianceNotMet(from, to);
            }
        }
    }

    function setCompliant(address account, bool status) internal {
        complianceStorage().compliant[account] = status;
    }

    function isCompliant(address account) internal view returns (bool) {
        ComplianceStorage storage cs = complianceStorage();
        return !cs.complianceEnabled || cs.compliant[account];
    }
}
