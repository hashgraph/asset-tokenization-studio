# ExternalListManagementStorageWrapper

_Asset Tokenization Studio Team_

> ExternalListManagementStorageWrapper

Internal library that manages the shared external-list storage struct reused across the control-list, KYC, pause and proceed-recipients namespaces.

_Each consumer passes its own `STORAGE*LOCATION*_`constant to the accessor; the same      struct layout is materialised at four independent ERC-7201 slots so consumers never share      state. All entry points are`internal` and intended for consumption by the corresponding facets and storage wrappers.\*
