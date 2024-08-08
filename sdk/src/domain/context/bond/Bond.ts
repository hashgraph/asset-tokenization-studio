import { Security, SecurityProps } from '../security/Security.js';

export interface BondProps extends SecurityProps {}

export class Bond extends Security implements BondProps {}
