# KycStorageWrapper Migration Analysis

## Estado Actual

**KycStorageWrapper** es una **librería** (134 líneas) que gestiona:

- KYC status de addresses (GRANTED, NOT_GRANTED)
- Validación de fechas VC (validFrom, validTo)
- Integración con SSI/Revocation lists
- Internal KYC activation flag

## Dependencias

### Imports (Layer 0)

```solidity
import { ExternalListManagementStorageWrapper } from "./ExternalListManagementStorageWrapper.sol";
import { SsiManagementStorageWrapper } from "./SsiManagementStorageWrapper.sol";
```

### Usuarios (Facets + Libraries)

```
ERC1594StorageWrapper.sol (Library) - 2 usos
  - verifyKycStatus(IKyc.KycStatus.GRANTED, from)
  - verifyKycStatus(IKyc.KycStatus.GRANTED, to)

Kyc.sol (Facet Layer 1) - imports
Bond.sol (Facet Layer 2) - imports
```

## Problema de Migración

**MISMO PROBLEMA QUE ControlListStorageWrapper:**

```solidity
// ERC1594StorageWrapper es LIBRERÍA
library ERC1594StorageWrapper {
    function isCompliant(...) {
        // ❌ NO COMPILA si KycStorageWrapper es abstract contract
        if (!KycStorageWrapper.verifyKycStatus(IKyc.KycStatus.GRANTED, from)) {
            // ...
        }
    }
}
```

**Error del compilador:**

```
TypeError: Cannot call function via contract type name
```

## Arquitectura Actual

```
┌─────────────────────────────────────────────────────────┐
│                 Layer 0 - Domain                        │
├─────────────────────────────────────────────────────────┤
│  KycStorageWrapper (Library)                            │
│  ├── verifyKycStatus()                                  │
│  ├── getKycStatusFor()                                  │
│  ├── grantKyc() / revokeKyc()                           │
│  └── kycStorage()                                       │
└─────────────────────────────────────────────────────────┘
                         ↓ usa
┌─────────────────────────────────────────────────────────┐
│                 Layer 0 - Domain                        │
├─────────────────────────────────────────────────────────┤
│  ERC1594StorageWrapper (Library - 439 líneas)          │
│  ├── isCompliant()                                      │
│  │   └── llama KycStorageWrapper.verifyKycStatus()     │
│  └── isIdentified()                                     │
│      └── llama KycStorageWrapper.verifyKycStatus()     │
└─────────────────────────────────────────────────────────┘
                         ↓ usa
┌─────────────────────────────────────────────────────────┐
│              Layer 1-2 - Facets                         │
├─────────────────────────────────────────────────────────┤
│  Kyc.sol (Layer 1)                                      │
│  Bond.sol (Layer 2)                                     │
│  ERC1594.sol (Layer 1)                                  │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

## Opciones de Migración

### Opción 1: Mantener como librería ✅ (Recomendada)

```solidity
library KycStorageWrapper {
    function verifyKycStatus(...) internal view returns (bool) { }
    function requireValidKycStatus(...) internal view { }
}
```

**Ventajas:**

- ✅ Compatible con ERC1594StorageWrapper (librería)
- ✅ Mínimo impacto (0 facets afectados)
- ✅ Patrón consistente con ControlListStorageWrapper

**Desventajas:**

- Sin modifiers (facets llaman funciones directamente)

---

### Opción 2: Abstract contract + KycModifiers

```solidity
abstract contract KycStorageWrapper {
    function _verifyKycStatus(...) internal view returns (bool) { }
    modifier onlyValidKycStatus(IKyc.KycStatus _status, address _account) { }
}

// ERC1594StorageWrapper NO PUEDE heredar - es librería
```

**Problema:** ERC1594StorageWrapper no puede llamar funciones de abstract contract.

**Solución:** Dual function pattern (internal + public)

```solidity
abstract contract KycStorageWrapper {
    // Para inheritance (facets)
    function _verifyKycStatus(...) internal view returns (bool) { }
    modifier onlyValidKycStatus(...) { }

    // Para librerías (ERC1594StorageWrapper)
    function verifyKycStatus(...) public view returns (bool) { }
}
```

**Impacto:**

- 134 líneas de librería → abstract contract
- ERC1594StorageWrapper necesita actualización (2 llamadas)
- Facets que usan KycStorageWrapper necesitan inheritance

---

### Opción 3: KycModifiers abstract contract (Patrón ControlList)

```solidity
library KycStorageWrapper {
    function verifyKycStatus(...) internal view returns (bool) { }
}

abstract contract KycModifiers {
    modifier onlyValidKycStatus(IKyc.KycStatus _status, address _account) {
        KycStorageWrapper.verifyKycStatus(_status, _account);
        _;
    }
}
```

**Ventajas:**

- ✅ KycStorageWrapper = librería (compatible con ERC1594StorageWrapper)
- ✅ Facets usan modifiers (mejor DX)
- ✅ Separación clara de responsabilidades

**Impacto:**

- Crear nuevo archivo `KycModifiers.sol`
- Actualizar facets que usan KYC (Bond.sol, Kyc.sol, etc.)

---

## Análisis de Impacto

### Facets que usan KycStorageWrapper

| Facet                 | Layer   | Uso                            | Impacto            |
| --------------------- | ------- | ------------------------------ | ------------------ |
| ERC1594StorageWrapper | Layer 0 | verifyKycStatus() (2 llamadas) | ⚠️ Alto (librería) |
| Kyc.sol               | Layer 1 | imports                        | ✅ Bajo            |
| Bond.sol              | Layer 2 | requireValidKycStatus()        | ✅ Bajo            |

### Comparación con ControlListStorageWrapper

| Aspecto                  | ControlList           | KycStorageWrapper      |
| ------------------------ | --------------------- | ---------------------- |
| **Líneas**               | 89                    | 134                    |
| **Usuarios (librerías)** | 1 (ERC1594)           | 1 (ERC1594)            |
| **Usuarios (facets)**    | 2 (Bond, ERC20Permit) | 3 (Kyc, Bond, ERC1594) |
| **Funciones core**       | 10                    | 12                     |
| **Complejidad**          | Media                 | Media-Alta             |

---

## Recomendación

**Opción 3: KycModifiers abstract contract**

```solidity
// KycStorageWrapper.sol - Mantener como librería
library KycStorageWrapper {
    function verifyKycStatus(...) internal view returns (bool) { }
    function requireValidKycStatus(...) internal view { }
}

// KycModifiers.sol - Nuevo abstract contract
abstract contract KycModifiers {
    modifier onlyValidKycStatus(IKyc.KycStatus _status, address _account) {
        KycStorageWrapper.verifyKycStatus(_status, _account);
        _;
    }
}
```

**Por qué:**

1. ✅ **ERC1594StorageWrapper compatible** (ambas librerías)
2. ✅ **Facets ganan modifiers** (mejor DX que llamar funciones)
3. ✅ **Mínimo acoplamiento** (KycModifiers solo wraps library)
4. ✅ **Consistente con ControlListModifiers** (mismo patrón)

---

## Implementación Propuesta

### Step 1: Crear KycModifiers.sol

```solidity
abstract contract KycModifiers {
  modifier onlyValidKycStatus(IKyc.KycStatus _status, address _account) {
    KycStorageWrapper.verifyKycStatus(_status, _account);
    _;
  }
}
```

### Step 2: Actualizar Bond.sol

```solidity
abstract contract Bond is ..., KycModifiers {
    function ... onlyValidKycStatus(IKyc.KycStatus.GRANTED, _tokenHolder) {
        // ...
    }
}
```

### Step 3: Actualizar Kyc.sol

```solidity
abstract contract Kyc is ..., KycModifiers {
    // Usa modifier en funciones de grant/revoke
}
```

### Step 4: Verificar compilación

```bash
npm run compile
```

---

## Conclusión

**KycStorageWrapper NO debe convertirse a abstract contract directamente** porque:

- ❌ ERC1594StorageWrapper (librería) no puede llamar abstract contracts
- ❌ Requiere dual function pattern (code duplication)
- ❌ Más complejo que ControlList (134 vs 89 líneas)

**Solución óptima:**

- ✅ **KycStorageWrapper = librería** (mantener)
- ✅ **KycModifiers = abstract contract** (nuevo, con modifiers)
- ✅ **ERC1594StorageWrapper compatible** (librería llama librería)
- ✅ **Facets usan modifiers** (mejor DX)

**Patrón:** Exactamente igual que ControlListModifiers.
