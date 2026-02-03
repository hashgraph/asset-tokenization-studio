// SPDX-License-Identifier: Apache-2.0

export default class FireblocksSettings {
  constructor(
    public apiKey: string,
    public apiSecretKey: string,
    public baseUrl: string,
    public assetId: string,
    public vaultAccountId: string,
    public hederaAccountId: string,
  ) {}
}
