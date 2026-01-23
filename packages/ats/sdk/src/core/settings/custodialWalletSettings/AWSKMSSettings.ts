// SPDX-License-Identifier: Apache-2.0

export default class AWSKMSSettings {
  constructor(
    public awsAccessKeyId: string,
    public awsSecretAccessKey: string,
    public awsRegion: string,
    public awsKmsKeyId: string,
    public hederaAccountId: string,
  ) {}
}
