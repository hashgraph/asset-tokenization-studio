import { QueryResponse } from '../../../core/query/QueryResponse.js';
import RegulationViewModel from './RegulationViewModel.js';

export default interface SecurityViewModel extends QueryResponse {
  name?: string;
  symbol?: string;
  isin?: string;
  type?: string;
  decimals?: number;
  isWhiteList?: boolean;
  isControllable?: boolean;
  isMultiPartition?: boolean;
  totalSupply?: string;
  maxSupply?: string;
  diamondAddress?: string;
  evmDiamondAddress?: string;
  paused?: boolean;
  regulation?: RegulationViewModel;
  isCountryControlListWhiteList?: boolean;
  countries?: string;
  info?: string;
}
