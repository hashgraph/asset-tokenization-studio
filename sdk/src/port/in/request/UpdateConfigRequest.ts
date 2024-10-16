import ValidatedRequest from './validation/ValidatedRequest';
import Validation from './validation/Validation';

export default class UpdateConfigRequest extends ValidatedRequest<UpdateConfigRequest> {
  configId: string;
  configVersion: number;
  securityId: string;

  constructor({
    configId,
    configVersion,
    securityId,
  }: {
    configId: string;
    configVersion: number;
    securityId: string;
  }) {
    super({
      configId: Validation.checkBytes32Format(),
      configVersion: Validation.checkNumber(),
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
    });

    this.configId = configId;
    this.configVersion = configVersion;
    this.securityId = securityId;
  }
}
