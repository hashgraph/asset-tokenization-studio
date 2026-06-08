# MaturityDateStorageWrapper

_Asset Tokenization Studio Team_

> MaturityDateStorageWrapper

Storage wrapper for the maturity date of any time-bounded token.

_Owns the dedicated ERC-7201 slot `STORAGE_LOCATION_MATURITY_DATE`. Designed to be shared across any asset type that carries an expiry or redemption date. Each token initialises its own Diamond proxy storage independently, so multiple asset types can import this wrapper without slot collision._
