/*
 *
 * Hedera Asset Tokenization Studio SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { ERC20MetadataInfo } from './ERC20Metadata.js';
import { Rbac } from './Rbac.js';

export class SecurityData {
  public isMultiPartition: boolean;
  public resolver: string;
  public businessLogicKeys: string[];
  public rbacs: Rbac[];
  public isControllable: boolean;
  public isWhiteList: boolean;
  public maxSupply: string;
  public erc20MetadataInfo: ERC20MetadataInfo;
}
