// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

// 1. Librería Matemática RAY (27 decimales)
library RayMath {
    uint256 internal constant _RAY = 1e27;
    uint256 internal constant _HALF_RAY = 0.5e27;

    function rayMul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0 || b == 0) return 0;
        return (a * b + _HALF_RAY) / _RAY;
    }

    function rayDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "Division por cero");
        return (a * _RAY + b / 2) / b;
    }
}

// 2. Contrato de Token Elástico con Bucles de Prueba
contract RayElasticToken {
    using RayMath for uint256;

    string public name = "Ray Elastic Token";
    string public symbol = "RET";
    uint8 public decimals = 6;

    mapping(address => uint256) private _shares;
    uint256 private _totalShares;

    // Multiplicador global en RAY (27 decimales)
    uint256 public globalMultiplierRay = RayMath._RAY;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor() {
        uint256 initialShares = 1000 * (10 ** decimals); // 1000 tokens
        _shares[msg.sender] = initialShares;
        _totalShares = initialShares;

        emit Transfer(address(0), msg.sender, initialShares);
    }

    // --- OPERACIONES SIMPLES ---

    function applyGlobalMultiplier(uint256 porcentajeTotal) external {
        uint256 factorRay = (porcentajeTotal * RayMath._RAY) / 100;
        globalMultiplierRay = globalMultiplierRay.rayMul(factorRay);
    }

    function applyGlobalDivisor(uint256 porcentajeTotal) external {
        uint256 factorRay = (porcentajeTotal * RayMath._RAY) / 100;
        globalMultiplierRay = globalMultiplierRay.rayDiv(factorRay);
    }

    // --- OPERACIONES EN BUCLE (TEST DE ESTRÉS) ---

    /**
     * @dev Aplica el multiplicador 'n' veces seguidas.
     */
    function applyGlobalMultiplierNTimes(uint256 porcentajeTotal, uint256 n) external {
        uint256 factorRay = (porcentajeTotal * RayMath._RAY) / 100;
        uint256 tempMultiplier = globalMultiplierRay; // Cargamos en memoria para ahorrar gas

        for (uint256 i = 0; i < n; i++) {
            tempMultiplier = tempMultiplier.rayMul(factorRay);
        }

        globalMultiplierRay = tempMultiplier; // Guardamos el estado final
    }

    /**
     * @dev Aplica el divisor 'n' veces seguidas. Ideal para buscar el límite de precisión.
     */
    function applyGlobalDivisorNTimes(uint256 porcentajeTotal, uint256 n) external {
        uint256 factorRay = (porcentajeTotal * RayMath._RAY) / 100;
        uint256 tempMultiplier = globalMultiplierRay;

        for (uint256 i = 0; i < n; i++) {
            tempMultiplier = tempMultiplier.rayDiv(factorRay);
        }

        globalMultiplierRay = tempMultiplier;
    }

    // --- FUNCIONES ERC20 ---
    function transfer(address to, uint256 amount) public returns (bool) {
        uint256 sharesToTransfer = amount.rayDiv(globalMultiplierRay);
        require(_shares[msg.sender] >= sharesToTransfer, "Saldo insuficiente");

        _shares[msg.sender] -= sharesToTransfer;
        _shares[to] += sharesToTransfer;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _shares[account].rayMul(globalMultiplierRay);
    }

    function totalSupply() public view returns (uint256) {
        return _totalShares.rayMul(globalMultiplierRay);
    }
}
