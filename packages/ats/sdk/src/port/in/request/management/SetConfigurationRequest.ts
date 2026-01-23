// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import Configuration from "@domain/context/network/Configuration";
import FormatValidation from "../FormatValidation";

export default class SetConfigurationRequest extends ValidatedRequest<SetConfigurationRequest> {
  factoryAddress: string;
  resolverAddress: string;

  constructor(props: Configuration) {
    super({
      factoryAddress: FormatValidation.checkContractId(),
      resolverAddress: FormatValidation.checkContractId(),
    });
    this.factoryAddress = props.factoryAddress;
    this.resolverAddress = props.resolverAddress;
  }
}
