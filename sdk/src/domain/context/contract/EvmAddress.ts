import ContractId from './ContractId.js';
import { InvalidEvmAddress } from './error/InvalidEvmAddress.js';

export default class EvmAddress {
  public readonly value: string;

  constructor(value: string) {
    if (value.length == 42 && value.startsWith('0x')) {
      this.value = value;
    } else if (value.length === 40) {
      this.value = '0x' + value;
    } else {
      throw new InvalidEvmAddress(value);
    }
  }

  toContractId(): ContractId {
    return ContractId.fromHederaEthereumAddress(this.value);
  }

  toString(): string {
    return this.value;
  }
}
