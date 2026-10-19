# ResolverProxyStorageWrapper

_Asset Tokenization Studio Team_

> ResolverProxyStorageWrapper

Internal library exposing read accessors for the resolver-proxy storage namespace.

_Mutations of these fields happen at proxy construction or via privileged upgrade flows; this wrapper only surfaces the values to facets that need to introspect the active resolver, configuration identifier or version._
