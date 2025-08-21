import { Network } from '@configuration';
export declare function addressListToHederaIdList({ addressList, network, }: {
    addressList: string[];
    network: Network;
}): Promise<string[]>;
export declare function addresstoHederaId({ address: address, network, }: {
    address: string;
    network: Network;
}): Promise<string>;
