import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import Configuration from '../../../domain/context/network/Configuration.js';
import { InvalidValue } from './error/InvalidValue.js';

export default class SetConfigurationRequest extends ValidatedRequest<SetConfigurationRequest> {
  factoryAddress: string;
  resolverAddress: string;
  businessLogicKeysCommon: string[];
  businessLogicKeysEquity: string[];
  businessLogicKeysBond: string[];

  constructor(props: Configuration) {
    super({
      factoryAddress: Validation.checkContractId(),
      resolverAddress: Validation.checkContractId(),
      businessLogicKeysCommon: (vals) => {
        if (vals.length == 0) {
          return [
            new InvalidValue(
              `The list of business logic keys Common cannot be empty.`,
            ),
          ];
        }

        for (let i = 0; i < vals.length; i++) {
          const err = Validation.checkBytes32Format()(vals[i]);
          if (err.length > 0) {
            return err;
          }
          if (vals.indexOf(vals[i]) != i) {
            return [
              new InvalidValue(`business logic key ${vals[i]} is duplicated`),
            ];
          }
        }
      },
      businessLogicKeysEquity: (vals) => {
        if (vals.length == 0) {
          return [
            new InvalidValue(
              `The list of business logic keys Equity cannot be empty.`,
            ),
          ];
        }

        for (let i = 0; i < vals.length; i++) {
          const err = Validation.checkBytes32Format()(vals[i]);
          if (err.length > 0) {
            return err;
          }
          if (vals.indexOf(vals[i]) != i) {
            return [
              new InvalidValue(`business logic key ${vals[i]} is duplicated`),
            ];
          }
        }
      },
      businessLogicKeysBond: (vals) => {
        if (vals.length == 0) {
          return [
            new InvalidValue(
              `The list of business logic keys Bond cannot be empty.`,
            ),
          ];
        }

        for (let i = 0; i < vals.length; i++) {
          const err = Validation.checkBytes32Format()(vals[i]);
          if (err.length > 0) {
            return err;
          }
          if (vals.indexOf(vals[i]) != i) {
            return [
              new InvalidValue(`business logic key ${vals[i]} is duplicated`),
            ];
          }
        }
      },
    });
    this.factoryAddress = props.factoryAddress;
    this.resolverAddress = props.resolverAddress;
    this.businessLogicKeysCommon = props.businessLogicKeysCommon;
    this.businessLogicKeysEquity = props.businessLogicKeysEquity;
    this.businessLogicKeysBond = props.businessLogicKeysBond;
  }
}
