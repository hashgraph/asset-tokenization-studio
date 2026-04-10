// SPDX-License-Identifier: Apache-2.0

import { Security, SecurityProps } from "../security/Security";

export interface LoanProps extends SecurityProps {}

export class Loan extends Security implements LoanProps {}
