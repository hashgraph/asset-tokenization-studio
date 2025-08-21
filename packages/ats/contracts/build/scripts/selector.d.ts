import { Interface } from 'ethers/lib/utils';
export declare function getSelector(contractFactory: {
    interface: Interface;
}, selector: string, asBytes4?: boolean): string;
