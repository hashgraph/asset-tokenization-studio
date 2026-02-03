// SPDX-License-Identifier: Apache-2.0

import { ProcessStatusType } from "../../types/status";

export interface PaymentData {
  paymentId: string;
  creationDate: string;
  paidAmount: number;
  batchCount: number;
  holders: number;
  status: ProcessStatusType;
  paymentType: string;
  progress: number;
}

export const mockPayments: PaymentData[] = [
  {
    paymentId: "0.0.123456",
    creationDate: "09/10/2024",
    paidAmount: 1500.5,
    batchCount: 80,
    holders: 90,
    status: "In Progress" as ProcessStatusType,
    paymentType: "Dividend",
    progress: 75,
  },
  {
    paymentId: "0.0.234567",
    creationDate: "08/10/2024",
    paidAmount: 2300.75,
    batchCount: 80,
    holders: 90,
    status: "Failed" as ProcessStatusType,
    paymentType: "Coupon",
    progress: 45,
  },
  {
    paymentId: "0.0.345678",
    creationDate: "04/10/2024",
    paidAmount: 5000.0,
    batchCount: 80,
    holders: 90,
    status: "Completed" as ProcessStatusType,
    paymentType: "Dividend",
    progress: 100,
  },
];
