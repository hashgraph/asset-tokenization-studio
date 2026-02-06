// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * RESPUESTA A ALBERTO:
 * "¿Cómo accedes a storage usando libraries?"
 * "¿Dónde defines el storage? En library no se puede"
 *
 * CORRECTO: Libraries NO pueden tener state variables propias.
 * SOLUCIÓN: Diamond Storage Pattern - defines structs fuera y accedes via storage pointer.
 */

// ============================================================================
// PASO 1: Define el storage struct (FUERA de la library)
// ============================================================================

struct PauseStorage {
    bool paused;
    address pausedBy;
    uint256 pausedAt;
}

struct AccessStorage {
    mapping(bytes32 => mapping(address => bool)) roles;
    mapping(bytes32 => bytes32) roleAdmin;
}

struct TokenStorage {
    string name;
    string symbol;
    uint8 decimals;
    uint256 totalSupply;
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;
}

// ============================================================================
// PASO 2: Libraries acceden al storage via storage pointer
// ============================================================================

library LibPauseStorage {
    // Diamond Storage slot - único y determinístico
    bytes32 constant PAUSE_STORAGE_SLOT = keccak256("diamond.storage.pause");

    // Función que devuelve el storage pointer
    function pauseStorage() internal pure returns (PauseStorage storage ps) {
        bytes32 slot = PAUSE_STORAGE_SLOT;
        assembly {
            ps.slot := slot
        }
    }
}

library LibAccessStorage {
    bytes32 constant ACCESS_STORAGE_SLOT = keccak256("diamond.storage.access");

    function accessStorage() internal pure returns (AccessStorage storage acs) {
        bytes32 slot = ACCESS_STORAGE_SLOT;
        assembly {
            acs.slot := slot
        }
    }
}

library LibTokenStorage {
    bytes32 constant TOKEN_STORAGE_SLOT = keccak256("diamond.storage.token");

    function tokenStorage() internal pure returns (TokenStorage storage ts) {
        bytes32 slot = TOKEN_STORAGE_SLOT;
        assembly {
            ts.slot := slot
        }
    }
}

// ============================================================================
// PASO 3: Libraries de lógica usan los storage pointers
// ============================================================================

library LibPause {
    error EnforcedPause();
    event Paused(address account);
    event Unpaused(address account);

    function isPaused() internal view returns (bool) {
        // Accede al storage via el pointer
        return LibPauseStorage.pauseStorage().paused;
    }

    function pause() internal {
        PauseStorage storage ps = LibPauseStorage.pauseStorage();
        ps.paused = true;
        ps.pausedBy = msg.sender;
        ps.pausedAt = block.timestamp;
        emit Paused(msg.sender);
    }

    function unpause() internal {
        PauseStorage storage ps = LibPauseStorage.pauseStorage();
        ps.paused = false;
        emit Unpaused(msg.sender);
    }

    function requireNotPaused() internal view {
        if (LibPauseStorage.pauseStorage().paused) {
            revert EnforcedPause();
        }
    }
}

library LibAccess {
    error Unauthorized(address account, bytes32 role);
    event RoleGranted(bytes32 role, address account);

    bytes32 constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    function hasRole(bytes32 role, address account) internal view returns (bool) {
        // Accede al storage via el pointer
        return LibAccessStorage.accessStorage().roles[role][account];
    }

    function checkRole(bytes32 role) internal view {
        if (!hasRole(role, msg.sender)) {
            revert Unauthorized(msg.sender, role);
        }
    }

    function grantRole(bytes32 role, address account) internal {
        AccessStorage storage acs = LibAccessStorage.accessStorage();
        acs.roles[role][account] = true;
        emit RoleGranted(role, account);
    }
}

library LibToken {
    event Transfer(address indexed from, address indexed to, uint256 value);

    function balanceOf(address account) internal view returns (uint256) {
        return LibTokenStorage.tokenStorage().balances[account];
    }

    function transfer(address from, address to, uint256 amount) internal {
        TokenStorage storage ts = LibTokenStorage.tokenStorage();

        require(ts.balances[from] >= amount, "Insufficient balance");

        ts.balances[from] -= amount;
        ts.balances[to] += amount;

        emit Transfer(from, to, amount);
    }

    function mint(address to, uint256 amount) internal {
        TokenStorage storage ts = LibTokenStorage.tokenStorage();
        ts.totalSupply += amount;
        ts.balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}

// ============================================================================
// PASO 4: Facet usa las libraries - TODO funciona!
// ============================================================================

contract ExampleFacet {

    function pause() external {
        LibAccess.checkRole(LibAccess.PAUSER_ROLE);  // Check permission
        LibPause.requireNotPaused();                   // Check not already paused
        LibPause.pause();                              // Do the pause
    }

    function unpause() external {
        LibAccess.checkRole(LibAccess.PAUSER_ROLE);
        LibPause.unpause();
    }

    function isPaused() external view returns (bool) {
        return LibPause.isPaused();
    }

    function transfer(address to, uint256 amount) external {
        LibPause.requireNotPaused();                   // Respect pause
        LibToken.transfer(msg.sender, to, amount);     // Do transfer
    }

    function balanceOf(address account) external view returns (uint256) {
        return LibToken.balanceOf(account);
    }

    function mint(address to, uint256 amount) external {
        LibAccess.checkRole(LibAccess.ADMIN_ROLE);     // Only admin
        LibPause.requireNotPaused();                    // Respect pause
        LibToken.mint(to, amount);                      // Do mint
    }
}
