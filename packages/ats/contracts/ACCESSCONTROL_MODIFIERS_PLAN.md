# Plan de Aplicación de Modifiers AccessControl

**Documento de Implementación**  
**Fecha:** 2026-03-17  
**Regla:** Modifiers son OBLIGATORIOS salvo fallo de compilación o bytecode excesivo  
**Estado:** Pendiente de Revisión

---

## 📋 Executive Summary

Se identificaron **74 archivos** que usan `AccessControlStorageWrapper.checkRole()` manualmente. Según la regla del proyecto, estos deben migrar a usar `modifier onlyRole()` explícito.

**Objetivo:** Reemplazar llamadas manuales a funciones de validación con modifiers explícitos en todas las facets.

---

## 1. Modifiers Requeridos

### 1.1 Los 3 Modifiers Obligatorios

```solidity
// 1. Validación de rol
modifier onlyRole(bytes32 _role) {
    _checkRole(_role, msg.sender);
    _;
}

// 2. Validación de longitud de arrays
modifier onlySameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) {
    _checkSameRolesAndActivesLength(_rolesLength, _activesLength);
    _;
}

// 3. Validación de consistencia de roles
modifier onlyConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) {
    _checkConsistentRoles(_roles, _actives);
    _;
}
```

**Regla:** Aplicar en TODOS los sitios EXCEPTO:

- ❌ Si compilación falla por parámetros excesivos
- ❌ Si bytecode excede límite (24KB para mainnet)

---

## 2. Análisis de Archivos Afectados

### 2.1 checkRole() - 74 Archivos

**Layer 0/Infrastructure (2 archivos):**

```
contracts/infrastructure/diamond/DiamondCut.sol          (1 llamada)
contracts/infrastructure/diamond/DiamondCutManager.sol   (1 llamada)
```

**Layer 1 - Core Facets (37 archivos):**

| Categoría              | Archivos                                                                                      | checkRole calls |
| ---------------------- | --------------------------------------------------------------------------------------------- | --------------- |
| **AccessControl**      | AccessControl.sol                                                                             | 2               |
| **ERC1400**            | ERC1410Management.sol, ERC1643.sol, ERC1644.sol                                               | 4               |
| **ERC3643**            | ERC3643Management.sol                                                                         | 9               |
| **Cap**                | Cap.sol                                                                                       | 2               |
| **Clearing**           | ClearingActions.sol, ClearingHoldCreation.sol, ClearingRedeem.sol, ClearingTransfer.sol       | 6               |
| **ControlList**        | ControlList.sol                                                                               | 2               |
| **CorporateAction**    | CorporateActions.sol                                                                          | 1               |
| **External\***         | ExternalControlListManagement.sol, ExternalKycListManagement.sol, ExternalPauseManagement.sol | 9               |
| **Hold**               | HoldManagement.sol                                                                            | 2               |
| **Kyc**                | Kyc.sol                                                                                       | 4               |
| **Lock**               | Lock.sol                                                                                      | 2               |
| **Pause**              | Pause.sol                                                                                     | 2               |
| **ProtectedPartition** | ProtectedPartitions.sol                                                                       | 2               |
| **Snapshot**           | Snapshots.sol                                                                                 | 1               |
| **Ssi**                | SsiManagement.sol                                                                             | 3               |

**Layer 2 - Domain Facets (13 archivos):**

```
contracts/facets/layer_2/adjustBalance/AdjustBalances.sol    (1)
contracts/facets/layer_2/bond/Bond.sol                       (4)
contracts/facets/layer_2/equity/Equity.sol                   (3)
contracts/facets/layer_2/interestRate/*/                     (4)
contracts/facets/layer_2/proceedRecipient/ProceedRecipients.sol (3)
```

**Layer 3 - Jurisdiction (1 archivo):**

```
contracts/facets/layer_3/transferAndLock/TransferAndLock.sol (2)
```

### 2.2 checkSameRolesAndActivesLength() + checkConsistentRoles() - 2 Archivos

**Solo en AccessControl.sol:**

```solidity
// Línea 32
AccessControlStorageWrapper.checkSameRolesAndActivesLength(_roles.length, _actives.length);

// Línea 33
AccessControlStorageWrapper.checkConsistentRoles(_roles, _actives);
```

---

## 3. Patrones de Uso Identificados

### 3.1 Patrón Predominante (checkRole manual)

```solidity
// Patrón actual (74 archivos)
function grantRole(bytes32 _role, address _account) external {
  AccessControlStorageWrapper.checkRole(_role, msg.sender);
  // ... lógica
}

// Patrón deseado (con modifier)
function grantRole(bytes32 _role, address _account) external onlyRole(_role) {
  // ... lógica
}
```

### 3.2 Variaciones Identificadas

**Variante 1: Role directo**

```solidity
AccessControlStorageWrapper.checkRole(_CAP_ROLE, msg.sender);
→ modifier onlyRole(_CAP_ROLE)
```

**Variante 2: Role dinámico (getRoleAdmin)**

```solidity
AccessControlStorageWrapper.checkRole(
    AccessControlStorageWrapper.getRoleAdmin(_role),
    msg.sender
);
→ modifier onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role))
```

**Variante 3: Múltiples roles**

```solidity
bytes32[] memory roles = new bytes32[](2);
roles[0] = _ISSUER_ROLE;
roles[1] = _AGENT_ROLE;
AccessControlStorageWrapper.checkAnyRole(roles, msg.sender);
→ Requiere modifier personalizado o mantener checkAnyRole
```

---

## 4. Plan de Migración

### 4.1 Fase 1: Actualizar AccessControl.sol (Base)

**Archivo:** `contracts/facets/layer_1/accessControl/AccessControl.sol`

**Cambios:**

```solidity
// ESTADO ACTUAL (líneas 32-33)
function applyRoles(
  bytes32[] calldata _roles,
  bool[] calldata _actives,
  address _account
) external override onlyUnpaused returns (bool success_) {
  AccessControlStorageWrapper.checkSameRolesAndActivesLength(_roles.length, _actives.length);
  AccessControlStorageWrapper.checkConsistentRoles(_roles, _actives);
  success_ = _applyRoles(_roles, _actives, _account);
  // ...
}

// ESTADO DESEADO (con modifiers)
function applyRoles(
  bytes32[] calldata _roles,
  bool[] calldata _actives,
  address _account
)
  external
  override
  onlyUnpaused
  onlySameRolesAndActivesLength(_roles.length, _actives.length)
  onlyConsistentRoles(_roles, _actives)
  returns (bool success_)
{
  success_ = _applyRoles(_roles, _actives, _account);
  // ...
}
```

**Nota:** AccessControl.sol ya hereda de `AccessControlStorageWrapper` (library), necesita crear modifiers propios.

### 4.2 Fase 2: Crear Abstract Contract con Modifiers

**Archivo:** `contracts/infrastructure/utils/AccessControlModifiers.sol` (nuevo)

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlStorageWrapper } from "../domain/core/AccessControlStorageWrapper.sol";

/**
 * @title AccessControlModifiers
 * @dev Abstract contract providing mandatory AccessControl modifiers
 */
abstract contract AccessControlModifiers {
  /**
   * @dev Modifier que valida msg.sender tiene el rol especificado
   */
  modifier onlyRole(bytes32 _role) {
    AccessControlStorageWrapper.checkRole(_role, msg.sender);
    _;
  }

  /**
   * @dev Modifier que valida msg.sender tiene cualquiera de los roles
   */
  modifier onlyAnyRole(bytes32[] memory _roles) {
    AccessControlStorageWrapper.checkAnyRole(_roles, msg.sender);
    _;
  }

  /**
   * @dev Modifier que valida longitudes de roles y actives son iguales
   */
  modifier onlySameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) {
    AccessControlStorageWrapper.checkSameRolesAndActivesLength(_rolesLength, _activesLength);
    _;
  }

  /**
   * @dev Modifier que valida roles y actives son consistentes (únicos)
   */
  modifier onlyConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) {
    AccessControlStorageWrapper.checkConsistentRoles(_roles, _actives);
    _;
  }
}
```

### 4.3 Fase 3: Migrar Todos los Facets

**Orden de migración:**

1. **Layer 1** (37 archivos) - Prioridad alta
2. **Layer 2** (13 archivos) - Prioridad media
3. **Layer 3** (1 archivo) - Prioridad baja
4. **Infrastructure** (2 archivos) - Prioridad media

**Por categoría (dentro de cada layer):**

| Prioridad | Categoría                                | Archivos | Complejidad |
| --------- | ---------------------------------------- | -------- | ----------- |
| **P0**    | AccessControl, Pause, Cap                | 5        | Baja        |
| **P1**    | Clearing, Hold, Kyc, Lock                | 8        | Media       |
| **P2**    | ERC1400, ERC3643                         | 13       | Alta        |
| **P3**    | External\*, ControlList, CorporateAction | 11       | Media       |
| **P4**    | Layer 2/3                                | 14       | Media       |

### 4.4 Ejemplo de Migración por Tipo

#### Tipo A: Role Directo (Más simple)

```solidity
// ANTES - Cap.sol línea 22
function setCap(uint256 _cap) external {
  AccessControlStorageWrapper.checkRole(_CAP_ROLE, msg.sender);
  // ...
}

// DESPUÉS - Con modifier heredado
function setCap(uint256 _cap) external onlyRole(_CAP_ROLE) {
  // ...
}
```

#### Tipo B: Role Dinámico (getRoleAdmin)

```solidity
// ANTES - AccessControl.sol línea 10
function grantRole(bytes32 _role, address _account) external {
  AccessControlStorageWrapper.checkRole(AccessControlStorageWrapper.getRoleAdmin(_role), msg.sender);
  // ...
}

// DESPUÉS - Con expresión en modifier
function grantRole(bytes32 _role, address _account) external onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role)) {
  // ...
}
```

#### Tipo C: Múltiples Roles (checkAnyRole)

```solidity
// ANTES - ERC3643Management.sol línea 61
function setAgent(address _agent) external {
  AccessControlStorageWrapper.checkRole(_AGENT_ROLE, msg.sender);
  // ...
}

// DESPUÉS - Requiere modifier onlyAnyRole o mantener manual
function setAgent(address _agent) external onlyRole(_AGENT_ROLE) {
  // ...
}
```

---

## 5. Evaluación de Bytecode

### 5.1 Límites de Tamaño

| Red         | Límite     | Advertencia |
| ----------- | ---------- | ----------- |
| **Mainnet** | 24.000 KiB | EIP-170     |
| **Testnet** | 24.000 KiB | EIP-170     |
| **Local**   | Sin límite | N/A         |

### 5.2 Facets en Riesgo

**Facets que ya exceden límite:**

```
Warning: 1 contracts exceed the size limit for mainnet deployment (24.000 KiB deployed, 48.000 KiB init).
```

**Facets grandes (verificar antes de migrar):**

- ERC3643Management.sol
- ERC1410Management.sol
- Clearing\*.sol (combinado)
- Bond.sol + Equity.sol

### 5.3 Criterio de Excepción

**NO migrar a modifier si:**

1. ✅ Compilación falla con error de stack too deep
2. ✅ Bytecode > 24KB para mainnet deployment
3. ✅ Function parameters > 1024 bytes (EVM limit)

**En esos casos:**

- Mantener llamada manual: `AccessControlStorageWrapper.checkRole(...)`
- Documentar en código por qué no se usó modifier
- Crear issue técnico para refactorización futura

---

## 6. Beneficios vs Costos

### 6.1 Beneficios

| Beneficio           | Impacto | Medición                          |
| ------------------- | ------- | --------------------------------- |
| **Consistencia**    | Alto    | 74 archivos uniformes             |
| **Claridad**        | Alto    | Validación explícita en signature |
| **Maintainability** | Alto    | Cambios en un solo lugar          |
| **Reusabilidad**    | Medio   | Modifiers heredables              |
| **Gas**             | Bajo    | Similar (inline en compile)       |

### 6.2 Costos

| Costo                     | Impacto | Mitigación                          |
| ------------------------- | ------- | ----------------------------------- |
| **Modificar 74 archivos** | Alto    | Migración incremental por categoría |
| **Testing**               | Alto    | Test suite existente debe pasar     |
| **Riesgo de regresión**   | Medio   | Code review por categoría           |
| **Documentación**         | Bajo    | Actualizar AGENTS.md                |

**Estimación esfuerzo:** 16-24 hrs (2 sprints)

---

## 7. Plan de Implementación

### Sprint 1: Foundation (8 hrs)

**Tareas:**

1. ✅ Crear `AccessControlModifiers.sol` abstract contract
2. ✅ Migrar `AccessControl.sol` (base para otros)
3. ✅ Migrar categoría P0 (5 archivos: AccessControl, Pause, Cap)
4. ✅ Compilar y verificar tests

**Deliverables:**

- `contracts/infrastructure/utils/AccessControlModifiers.sol`
- 6 archivos migrados y testeando

### Sprint 2: Core Facets (8 hrs)

**Tareas:**

1. ✅ Migrar categoría P1 (8 archivos: Clearing, Hold, Kyc, Lock)
2. ✅ Migrar categoría P2 (13 archivos: ERC1400, ERC3643)
3. ✅ Compilar y verificar tests
4. ✅ Code review de migraciones

**Deliverables:**

- 21 archivos migrados y testeando
- Code review completado

### Sprint 3: Completion (8 hrs)

**Tareas:**

1. ✅ Migrar categoría P3 (11 archivos: External\*, ControlList, etc.)
2. ✅ Migrar categoría P4 (14 archivos: Layer 2/3)
3. ✅ Migrar infrastructure (2 archivos)
4. ✅ Actualizar AGENTS.md con patrones
5. ✅ Documentar excepciones (si las hay)

**Deliverables:**

- 74 archivos migrados
- Documentación actualizada
- Issue técnico para excepciones (si las hay)

---

## 8. Métricas de Éxito

### 8.1 KPIs de Migración

| KPI                         | Target                           | Actual |
| --------------------------- | -------------------------------- | ------ |
| **Archivos migrados**       | 74                               | TBD    |
| **Tests passing**           | 100%                             | TBD    |
| **Compilación sin errores** | ✅ SI                            | TBD    |
| **Bytecode < 24KB**         | ✅ SI (o documentar excepciones) | TBD    |
| **Gas difference**          | < 5%                             | TBD    |

### 8.2 Quality Gates

**Antes de merge:**

- ✅ Todos los tests pasan
- ✅ Compilación sin warnings críticos
- ✅ Code review completado
- ✅ AGENTS.md actualizado
- ✅ Excepciones documentadas (si las hay)

---

## 9. Riesgos y Mitigación

### 9.1 Riesgos Técnicos

| Riesgo                | Probabilidad | Impacto   | Mitigación                        |
| --------------------- | ------------ | --------- | --------------------------------- |
| **Bytecode overflow** | Media        | 🔴 HIGH   | Verificar tamaño antes de migrar  |
| **Stack too deep**    | Baja         | 🔴 HIGH   | Mantener llamada manual si ocurre |
| **Test failures**     | Media        | 🟡 MEDIUM | Fix tests durante migración       |
| **Breaking changes**  | Baja         | 🟢 LOW    | No cambia interfaz externa        |

### 9.2 Riesgos de Proyecto

| Riesgo                          | Impacto | Mitigación                        |
| ------------------------------- | ------- | --------------------------------- |
| **Desviar de features**         | Alto    | Migrar en paralelo a features     |
| **Retrasar sprint**             | Medio   | Estimar 2-3 sprints completos     |
| **Deuda técnica si incompleto** | Alto    | Completar o revertir parcialmente |

---

## 10. Recomendación

### 10.1 Decisión

**IMPLEMENTAR** migración de modifiers en 3 sprints.

### 10.2 Justificación

1. **Regla del proyecto:** Modifiers son obligatorios
2. **Beneficio alto:** 74 archivos con consistencia
3. **Costo aceptable:** 16-24 hrs distribuidas en 3 sprints
4. **Riesgo mitigable:** Verificar bytecode antes de cada migración
5. **Pattern industry-standard:** Explicit validation via modifiers

### 10.3 Próximos Pasos

1. ✅ Crear issue en tracker para migración
2. ✅ Asignar a 2 developers (parallel work)
3. ✅ Comenzar Sprint 1 (Foundation)
4. ✅ Documentar progreso en issue
5. ✅ Code review después de cada categoría

---

## 11. Apéndices

### 11.1 Lista Completa de Archivos (74)

**Infrastructure (2):**

```
1. contracts/infrastructure/diamond/DiamondCut.sol
2. contracts/infrastructure/diamond/DiamondCutManager.sol
```

**Layer 1 - AccessControl (1):**

```
3. contracts/facets/layer_1/accessControl/AccessControl.sol
```

**Layer 1 - ERC1400 (3):**

```
4. contracts/facets/layer_1/ERC1400/ERC1410/ERC1410Management.sol
5. contracts/facets/layer_1/ERC1400/ERC1643/ERC1643.sol
6. contracts/facets/layer_1/ERC1400/ERC1644/ERC1644.sol
```

**Layer 1 - ERC3643 (1):**

```
7. contracts/facets/layer_1/ERC3643/ERC3643Management.sol
```

**Layer 1 - Cap (1):**

```
8. contracts/facets/layer_1/cap/Cap.sol
```

**Layer 1 - Clearing (4):**

```
9. contracts/facets/layer_1/clearing/ClearingActions.sol
10. contracts/facets/layer_1/clearing/ClearingHoldCreation.sol
11. contracts/facets/layer_1/clearing/ClearingRedeem.sol
12. contracts/facets/layer_1/clearing/ClearingTransfer.sol
```

**Layer 1 - ControlList (1):**

```
13. contracts/facets/layer_1/controlList/ControlList.sol
```

**Layer 1 - CorporateAction (1):**

```
14. contracts/facets/layer_1/corporateAction/CorporateActions.sol
```

**Layer 1 - External\* (3):**

```
15. contracts/facets/layer_1/externalControlList/ExternalControlListManagement.sol
16. contracts/facets/layer_1/externalKycList/ExternalKycListManagement.sol
17. contracts/facets/layer_1/externalPause/ExternalPauseManagement.sol
```

**Layer 1 - Hold (1):**

```
18. contracts/facets/layer_1/hold/HoldManagement.sol
```

**Layer 1 - Kyc (1):**

```
19. contracts/facets/layer_1/kyc/Kyc.sol
```

**Layer 1 - Lock (1):**

```
20. contracts/facets/layer_1/lock/Lock.sol
```

**Layer 1 - Pause (1):**

```
21. contracts/facets/layer_1/pause/Pause.sol
```

**Layer 1 - ProtectedPartition (1):**

```
22. contracts/facets/layer_1/protectedPartition/ProtectedPartitions.sol
```

**Layer 1 - Snapshot (1):**

```
23. contracts/facets/layer_1/snapshot/Snapshots.sol
```

**Layer 1 - Ssi (1):**

```
24. contracts/facets/layer_1/ssi/SsiManagement.sol
```

**Layer 2 - AdjustBalance (1):**

```
25. contracts/facets/layer_2/adjustBalance/AdjustBalances.sol
```

**Layer 2 - Bond (1):**

```
26. contracts/facets/layer_2/bond/Bond.sol
```

**Layer 2 - Equity (1):**

```
27. contracts/facets/layer_2/equity/Equity.sol
```

**Layer 2 - InterestRate (4):**

```
28. contracts/facets/layer_2/interestRate/fixedRate/FixedRate.sol
29. contracts/facets/layer_2/interestRate/kpiLinkedRate/KpiLinkedRate.sol
30. contracts/facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/SustainabilityPerformanceTargetRate.sol
```

**Layer 2 - ProceedRecipient (1):**

```
31. contracts/facets/layer_2/proceedRecipient/ProceedRecipients.sol
```

**Layer 3 - TransferAndLock (1):**

```
32. contracts/facets/layer_3/transferAndLock/TransferAndLock.sol
```

### 11.2 Referencias

- [Solidity Modifiers](https://docs.soliditylang.org/en/latest/contracts.html#function-modifiers)
- [EIP-170: Code Size Limit](https://eips.ethereum.org/EIPS/eip-170)
- [Gas Optimization Techniques](https://github.com/0xProject/0x-monorepo/blob/development/contracts/protocol/README.md)

---

**Fin del Documento**
