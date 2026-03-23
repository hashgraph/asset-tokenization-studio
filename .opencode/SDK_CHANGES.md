# Resumen de Cambios SDK

## Archivos a Modificar en SDK

### 1. RPCTransactionAdapter.ts

**Cambios en imports (líneas 36-77):**

ELIMINAR:

- ClearingActionsFacet\_\_factory
- ClearingHoldCreationFacet\_\_factory
- ClearingRedeemFacet\_\_factory
- ClearingTransferFacet\_\_factory
- ERC1410ManagementFacet\_\_factory
- ERC3643BatchFacet\_\_factory
- ERC3643ManagementFacet\_\_factory
- ERC3643OperationsFacet\_\_factory
- HoldManagementFacet\_\_factory
- HoldTokenHolderFacet\_\_factory
- ERC1410TokenHolderFacet\_\_factory
- ERC1410IssuerFacet\_\_factory

AGREGAR:

- ClearingFacet\_\_factory
- ERC3643Facet\_\_factory
- ERC1410Facet\_\_factory
- HoldFacet\_\_factory

### 2. RPCQueryAdapter.ts

Mismos cambios que RPCTransactionAdapter.ts

### 3. HederaTransactionAdapter.ts

Mismos cambios que RPCTransactionAdapter.ts

### 4. Scripts a actualizar:

- atsRegistry.data.ts
- orchestratorLibraries.ts

### 5. Tests a actualizar:

- clearing.test.ts (YA HECHO)
- totalBalance.test.ts (YA HECHO)
- bond.fixture.ts (YA HECHO)

## Nota

Los contratos han sido eliminados, por lo que los imports fallarán al compilar el SDK si no se actualizan.
