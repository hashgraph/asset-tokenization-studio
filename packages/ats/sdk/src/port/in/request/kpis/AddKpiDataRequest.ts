// SPDX-License-Identifier: Apache-2.0

import { IsNotEmpty, IsString, IsNumber } from "class-validator";
import EvmAddress from "@domain/context/contract/EvmAddress";

export class AddKpiDataRequest {
  @IsNotEmpty()
  @IsString()
  securityId!: string;

  @IsNotEmpty()
  @IsNumber()
  date!: number;

  @IsNotEmpty()
  @IsString()
  value!: string;

  @IsNotEmpty()
  project!: EvmAddress;

  constructor(data: Partial<AddKpiDataRequest>) {
    Object.assign(this, data);
  }
}
