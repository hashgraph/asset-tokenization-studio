// SPDX-License-Identifier: Apache-2.0

export default class DfnsSettings {
  constructor(
    public serviceAccountSecretKey: string,
    public serviceAccountCredentialId: string,
    public serviceAccountAuthToken: string,
    public appOrigin: string,
    public appId: string,
    public baseUrl: string,
    public walletId: string,
    public hederaAccountId: string,
    public publicKey: string,
  ) {}
}
