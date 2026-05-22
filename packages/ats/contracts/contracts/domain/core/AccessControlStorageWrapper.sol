// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IAccessControl } from "../../facets/accessControl/IAccessControl.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";

/// @custom:hash storage AccessControl
bytes32 constant STORAGE_LOCATION_ACCESS_CONTROL = 0xff8881325a7cc80adb7ddfb5e52c7103d092b4d7833f49efafbcb1abd73a4900;

/**
 * @notice Per-role record holding the role's admin pointer and its current member set.
 * @dev Stored as a value in the `roles` mapping. `roleAdmin` is the role required to grant or
 *      revoke membership; `roleMembers` is the enumerable set of current holders.
 */
struct RoleData {
    bytes32 roleAdmin;
    EnumerableSet.AddressSet roleMembers;
}

/**
 * @notice Diamond storage layout for role-based access control.
 * @dev Indexed in both directions: `roles[role]` lists the members for fast `hasRole` checks
 *      and enumeration, while `memberRoles[account]` lists the roles per account for
 *      `getRolesFor`. The two maps are kept in lock-step by every write path in this library.
 * @custom:storage-location erc7201:security.token.standard.storage.AccessControl
 */
struct RoleDataStorage {
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(bytes32 => RoleData) roles;
    mapping(address => EnumerableSet.Bytes32Set) memberRoles;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title AccessControlStorageWrapper
 * @dev Library providing access control storage operations with Diamond Storage Pattern
 *
 * This library uses ERC-2535 Diamond Storage Pattern to store role data in a specific storage slot.
 * It provides storage operations, read functions, and guard checks for role-based access control.
 *
 * @notice Use with `using AccessControlStorageWrapper for RoleDataStorage;` or call functions directly
 * @author Asset Tokenization Studio Team
 */
library AccessControlStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /**
     * @notice Resolves the access-control storage struct at its diamond storage slot.
     * @dev Binds the struct pointer to `STORAGE_LOCATION_ACCESS_CONTROL` via inline assembly.
     * @return roles_ Storage reference to the `RoleDataStorage` struct.
     */
    function rolesStorage() internal pure returns (RoleDataStorage storage roles_) {
        bytes32 position = STORAGE_LOCATION_ACCESS_CONTROL;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            roles_.slot := position
        }
    }

    /**
     * @notice Reverts when the `roles` and `actives` arrays passed to `applyRoles` differ in
     *         length.
     * @param _rolesLength   Length of the roles array.
     * @param _activesLength Length of the parallel actives array.
     */
    function checkSameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) internal pure {
        if (_rolesLength != _activesLength) {
            revert IAccessControl.RolesAndActivesLengthMismatch(_rolesLength, _activesLength);
        }
    }

    /**
     * @notice Reverts when a role appears more than once in the parallel `_roles`/`_actives`
     *         input batches.
     * @dev Delegates to `ArrayValidation.checkUniqueValues` so duplicate-role entries cannot
     *      silently overwrite each other in `applyRoles`.
     * @param _roles   Roles being applied in the batch.
     * @param _actives Parallel active flags aligned with `_roles`.
     */
    function checkConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) internal pure {
        ArrayValidation.checkUniqueValues(_roles, _actives);
    }

    /**
     * @notice Reads role membership directly from the supplied storage reference.
     * @dev Reverse-indexed lookup via `memberRoles` to avoid resolving the storage slot twice
     *      in batch operations such as `applyRoles`.
     * @param _rolesStorageData Storage reference resolved once by the caller.
     * @param _role             Role being checked.
     * @param _account          Account being checked.
     * @return hasRole_ True when `_account` holds `_role`.
     */
    function _has(
        RoleDataStorage storage _rolesStorageData,
        bytes32 _role,
        address _account
    ) private view returns (bool hasRole_) {
        hasRole_ = _rolesStorageData.memberRoles[_account].contains(_role);
    }

    /**
     * @notice Adds `_account` to the holders of `_role` and keeps the reverse index in sync.
     * @dev Both writes must succeed for `success_` to be true; if either set already contains
     *      the entry, the operation reports failure without reverting.
     * @param _role    Role being granted.
     * @param _account Account receiving the role.
     * @return success_ True when both directions of the index were updated.
     */
    // solhint-disable-next-line ordering
    function grantRole(bytes32 _role, address _account) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        success_ =
            roleDataStorage.roles[_role].roleMembers.add(_account) &&
            roleDataStorage.memberRoles[_account].add(_role);
    }

    /**
     * @notice Removes `_account` from the holders of `_role` and keeps the reverse index in
     *         sync.
     * @dev Both removals must succeed for `success_` to be true; if either set does not
     *      contain the entry, the operation reports failure without reverting.
     * @param _role    Role being revoked.
     * @param _account Account losing the role.
     * @return success_ True when both directions of the index were updated.
     */
    function revokeRole(bytes32 _role, address _account) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        success_ =
            roleDataStorage.roles[_role].roleMembers.remove(_account) &&
            roleDataStorage.memberRoles[_account].remove(_role);
    }

    /**
     * @notice Applies a batch of role grants and revocations to `_account` in a single call.
     * @dev For each entry, asserts the caller holds the role's admin via `checkRole`, then
     *      diffs current membership against the desired `_actives` flag. Skips no-op updates
     *      to avoid spurious set churn. Reverts via `checkRole` if the caller lacks the admin
     *      role for any entry.
     * @param _roles   Roles to apply, indexed in parallel with `_actives`.
     * @param _actives Desired membership flag per role (`true` grants, `false` revokes).
     * @param _account Account being updated.
     * @return success_ Always true on a successful return.
     */
    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) internal returns (bool success_, bytes32[] memory appliedRoles_, bool[] memory appliedActives_) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        address sender = EvmAccessors.getMsgSender();
        uint256 length = _roles.length;

        appliedRoles_ = new bytes32[](length);
        appliedActives_ = new bool[](length);
        uint256 count;

        for (uint256 index; index < length; ) {
            bytes32 role = _roles[index];
            bool active = _actives[index];

            checkRole(getRoleAdmin(role), sender);

            if (active) {
                if (!_has(roleDataStorage, role, _account)) {
                    roleDataStorage.roles[role].roleMembers.add(_account);
                    roleDataStorage.memberRoles[_account].add(role);
                    appliedRoles_[count] = role;
                    appliedActives_[count] = true;
                    unchecked {
                        ++count;
                    }
                }
            } else if (_has(roleDataStorage, role, _account)) {
                roleDataStorage.roles[role].roleMembers.remove(_account);
                roleDataStorage.memberRoles[_account].remove(role);
                appliedRoles_[count] = role;
                appliedActives_[count] = false;
                unchecked {
                    ++count;
                }
            }

            unchecked {
                ++index;
            }
        }

        assembly {
            mstore(appliedRoles_, count)
            mstore(appliedActives_, count)
        }

        success_ = true;
    }

    /**
     * @notice Reverts with `AccountHasNoRole` when `_account` does not hold `_role`.
     * @param _role    Role required.
     * @param _account Account being checked.
     */
    function checkRole(bytes32 _role, address _account) internal view {
        if (!hasRole(_role, _account)) revert IAccessControl.AccountHasNoRole(_account, _role);
    }

    /**
     * @notice Reverts with `AccountHasNoRoles` when `_account` holds none of `_roles`.
     * @param _roles   Set of acceptable roles for the caller.
     * @param _account Account being checked.
     */
    function checkAnyRole(bytes32[] memory _roles, address _account) internal view {
        if (!hasAnyRole(_roles, _account)) revert IAccessControl.AccountHasNoRoles(_account, _roles);
    }

    /// @notice Reverts if the caller is the sole holder of `DEFAULT_ADMIN_ROLE`.
    /// @dev Guards `renounceRole` so the contract cannot be left without an admin.
    /// @param _role The role being renounced.
    function checkNotSoleAdmin(bytes32 _role) internal view {
        if (_isSoleAdmin(_role)) revert IAccessControl.CannotRenounceSoleAdmin();
    }

    /// @notice Returns `true` when `_role` is `DEFAULT_ADMIN_ROLE` and only one member holds it.
    /// @param _role The role to inspect.
    /// @return `true` if the caller would be the sole admin after renouncing.
    function _isSoleAdmin(bytes32 _role) private view returns (bool) {
        return _role == DEFAULT_ADMIN_ROLE && rolesStorage().roles[_role].roleMembers.length() == 1;
    }

    /**
     * @notice Returns the admin role required to grant or revoke `_role`.
     * @param _role Role whose admin is being queried.
     * @return bytes32 Admin role identifier; defaults to `DEFAULT_ADMIN_ROLE` when unset.
     */
    function getRoleAdmin(bytes32 _role) internal view returns (bytes32) {
        return rolesStorage().roles[_role].roleAdmin;
    }

    /**
     * @notice Returns whether `_account` currently holds `_role`.
     * @param _role    Role being checked.
     * @param _account Account being checked.
     * @return bool True when `_account` holds `_role`.
     */
    function hasRole(bytes32 _role, address _account) internal view returns (bool) {
        return _has(rolesStorage(), _role, _account);
    }

    /**
     * @notice Returns whether `_account` holds any of the supplied `_roles`.
     * @dev Short-circuits on the first match; iteration is bounded by the caller-supplied
     *      length so unbounded-loop risk lives at the call site.
     * @param _roles   Roles to test.
     * @param _account Account being checked.
     * @return bool True when `_account` holds at least one role from `_roles`.
     */
    function hasAnyRole(bytes32[] memory _roles, address _account) internal view returns (bool) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        for (uint256 i; i < _roles.length; ) {
            if (_has(roleDataStorage, _roles[i], _account)) {
                return true;
            }
            unchecked {
                ++i;
            }
        }
        return false;
    }

    /**
     * @notice Returns the number of roles currently held by `_account`.
     * @param _account Account being queried.
     * @return roleCount_ Cardinality of the reverse `memberRoles[_account]` set.
     */
    function getRoleCountFor(address _account) internal view returns (uint256 roleCount_) {
        roleCount_ = rolesStorage().memberRoles[_account].length();
    }

    /**
     * @notice Returns a paged slice of roles currently held by `_account`.
     * @param _account    Account being queried.
     * @param _pageIndex  Zero-based page index for paginated enumeration.
     * @param _pageLength Page size used by the underlying enumerable set.
     * @return roles_ Page of role identifiers held by `_account`.
     */
    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory roles_) {
        roles_ = rolesStorage().memberRoles[_account].getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of accounts currently holding `_role`.
     * @param _role Role being queried.
     * @return memberCount_ Cardinality of the `roles[_role].roleMembers` set.
     */
    function getRoleMemberCount(bytes32 _role) internal view returns (uint256 memberCount_) {
        memberCount_ = rolesStorage().roles[_role].roleMembers.length();
    }

    /**
     * @notice Returns a paged slice of accounts currently holding `_role`.
     * @param _role       Role being queried.
     * @param _pageIndex  Zero-based page index for paginated enumeration.
     * @param _pageLength Page size used by the underlying enumerable set.
     * @return members_ Page of member addresses currently holding `_role`.
     */
    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = rolesStorage().roles[_role].roleMembers.getFromSet(_pageIndex, _pageLength);
    }
}
