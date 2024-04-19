<div align="center">

# Business Logic Resolver


</div>

### Table of Contents
- **[DESCRIPTION](#description)**<br>
- **[EXAMPLE](#example)**<br>
  - [REGISTER](#register)<br>


# DESCRIPTION
The **_Business Logic Resolver (BLR)_** is a smart contract that centralizes the management of Business Logics versions.

DApps Business Logics are normally split into multiple smart contracts. 
Developers might deploy newer versions of those smart contracts, might add new smart contracts to the DApp Business Logic or might remove smart contracts from the Dapp business Logic.

**_BLR_** manages all that, so that DApps only need to store a list of **_Business Logic Keys (BLK)_** (each **_BLK_** uniquely identifies one of the smart contracts that form the DApp Business Logic). These keys can be used to retrieve the **_Business Logic Address (BLA)_** (the **_BLA_** is the address of the smart contract associated to the **_BLK_**) of the **_latest version_** or any **_previous version_**.

The **_Business Logics (BL)_** (aka smart contracts) retrieved for a specific version are supposed to be compatible with each other. **_BL_** from different versions are not necessary compatible.

**_BLR_** allows for a **_Status_** to be assigned to a version (sort of like a tag). Only one Status can be assigned to a version at a given time, and its meaning its beyond the scope of the **_BLR_** (DApps interacting with the **_BLR_** are supposed to understand what a version status means).

**_BLR_** offers the possibility to register new **_BL_** versions (change its **_BLA_**) and add new **_BL_** to the registry.

- **Registring** a new **_BL_** version or adding a new **_BL_** with result in creating a new **latest version** for all registered **_BLs_**

_if many BLs need to be registered for a version, and the whole operation cannot be fit into a single transaction (Gas limit), the sender can tag the new version as "partial" then keep sending transactions until the operation completes. The last transaction must remove the "partial" tag_

In order to better understand how the Register operation of the **_BLR_** work check the below example.


# EXAMPLE

## REGISTER

### V1 (Initial state)

| **Business Logic Key** | **V1**            |
|:-----------------------|:------------------|
| **0xabc**              | 0x0123            |
| **0xbcd**              | 0x0456            |
| **0xcde**              | 0x0789            |


### V2

- **0xabc** Business Logic new address **_0x0111_**
- **0xbcd** Business Logic new address **_0x0222_**
- **0xcde** Business Logic previous address **_0x0789_**


| **Business Logic Key** | **V1**            | **V2**                |
|:-----------------------|:------------------|:----------------------|
| **0xabc**              | 0x0123            | **_0x0111_**          |
| **0xbcd**              | 0x0456            | **_0x0222_**          |
| **0xcde**              | 0x0789            | 0x0789                |


### V3

- **0xabc** Business Logic previous address **_0x0111_**
- **0xbcd** Business Logic previous address **_0x0222_**
- **0xcde** Business Logic previous address **_0x0789_**
- **0xdef** Business Logic added to the registry with address **_0x0444_**


| **Business Logic Key** | **V1**                  | **V2**                  | **V3**                |
|:-----------------------|:------------------------|:------------------------|:----------------------|
| **0xabc**              | 0x0123                  | 0x0111                  | 0x0111                |
| **0xbcd**              | 0x0456                  | 0x0222                  | 0x0222                |
| **0xcde**              | 0x0789                  | 0x0789                  | 0x0789                |
| **0xdef**              | **_0x0000_**            | **_0x0000_**            | **_0x0444_**          |


### V4

- **0xabc** Business Logic new address **_0x0666_**
- **0xbcd** Business Logic new address **_0x0777_**
- **0xcde** Business Logic new address **_0x0000_** => This is a way of **decommissioning** a Business Logic
- **0xdef** Business Logic previously with address **_0x0444_**
- **0xefg** Business Logic added to the registry with address **_0x0555_**


| **Business Logic Key** | **V1**                  | **V2**                  | **V3**                  | **V4**                  |
|:-----------------------|:------------------------|:------------------------|:------------------------|:------------------------|
| **0xabc**              | 0x0123                  | 0x0111                  | 0x0111                  | **_0x0666_**            |
| **0xbcd**              | 0x0456                  | 0x0222                  | 0x0222                  | **_0x0777_**            |
| **0xcde**              | 0x0789                  | 0x0789                  | 0x0789                  | **_0x0000_**            |
| **0xdef**              | 0x0000                  | 0x0000                  | 0x0444                  | 0x0444                  |
| **0xefg**              | **_0x0000_**            | **_0x0000_**            | **_0x0000_**            | **_0x0555_**            |

