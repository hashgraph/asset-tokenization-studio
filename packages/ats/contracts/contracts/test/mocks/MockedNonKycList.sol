// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalKycList } from "../../facets/externalKycListManagement/IExternalKycList.sol";
import { IKyc } from "../../facets/kyc/IKyc.sol";

/**
 * @title MockedSilentFallback
 * @author Asset Tokenization Studio Team
 * @notice Answers every selector with success and empty returndata.
 * @dev The observable behaviour of a contract with a silent fallback and of a Hedera
 * token's HIP-719 facade. Accepted as an external KYC list today; every transfer
 * afterwards reverts inside `isExternallyGranted` when the ABI decoder rejects the
 * empty answer.
 */
contract MockedSilentFallback {
    // solhint-disable-next-line no-empty-blocks
    fallback() external {}
}

/**
 * @title MockedWrongInterface
 * @author Asset Tokenization Studio Team
 * @notice A contract that is not an `IExternalKycList` and has no fallback.
 * @dev Reverts on the `getKycStatus` selector rather than answering it. Accepted as an
 * external KYC list today, which is the C2 case: a real contract, wired to the wrong seam.
 */
contract MockedWrongInterface {
    /**
     * @notice Returns a constant, so the contract has code and a selector that is not the seam's.
     * @return An arbitrary non-zero value.
     */
    function someOtherFunction() external pure returns (uint256) {
        return 1;
    }
}

/**
 * @title MockedBreakableKycList
 * @author Asset Tokenization Studio Team
 * @notice A conforming external KYC list that can be made to stop answering.
 * @dev Exists to exercise the recovery path. `removeExternalKycList` is deliberately not
 * guarded by the registration probe, because removal must keep working on a list that has
 * stopped answering; that is the only way out of the state this bug creates.
 */
contract MockedBreakableKycList is IExternalKycList {
    bool public broken;
    mapping(address => IKyc.KycStatus) private _kycStatus;

    /**
     * @notice Grants KYC to `account` so the list can be used as a working control.
     * @param account Address to mark as GRANTED.
     */
    function grantKyc(address account) external {
        _kycStatus[account] = IKyc.KycStatus.GRANTED;
    }

    /**
     * @notice Makes every later `getKycStatus` call revert, simulating a list that has stopped
     *         answering after it was registered.
     */
    function breakList() external {
        broken = true;
    }

    /// @inheritdoc IExternalKycList
    function getKycStatus(address account) external view override returns (IKyc.KycStatus) {
        require(!broken, "list is broken");
        return _kycStatus[account];
    }
}
