// SPDX-License-Identifier: Apache-2.0

import {
  FormAmountType,
  FormDistributionType,
  NewDistributionFormValues,
  RecurringFrequency,
  TriggerCondition,
} from "./NewDistribution.types";

export const DEFAULT_FORM_VALUES: NewDistributionFormValues = {
  amountType: FormAmountType.FIXED,
  amount: 0,
  distributionType: "",
  concept: "",
  scheduledDate: "",
  recurringFrequency: "",
  recurringStartDate: "",
  triggerCondition: TriggerCondition.ON_DEPOSIT,
};

export const BREADCRUMB_ITEMS = [
  { label: "Asset list", link: "/assets" },
  {
    label: "New Distribution",
    link: "#",
  },
];

export const VALIDATION_CONSTANTS = {
  MIN_AMOUNT: 0.01,
  MAX_PERCENTAGE: 100,
  DECIMAL_SCALE: 2,
} as const;

// Option generators
export const createDistributionTypeOptions = (t: (key: string) => string) => [
  {
    value: FormDistributionType.MANUAL,
    label: t("newDistribution.distributionType.manual"),
  },
  {
    value: FormDistributionType.SCHEDULED,
    label: t("newDistribution.distributionType.scheduled"),
  },
  {
    value: FormDistributionType.RECURRING,
    label: t("newDistribution.distributionType.recurring"),
  },
  {
    value: FormDistributionType.AUTOMATED,
    label: t("newDistribution.distributionType.automated"),
  },
];

export const createRecurringOptions = (t: (key: string) => string) => [
  {
    value: RecurringFrequency.HOURLY,
    label: t("newDistribution.recurringOptions.hourly"),
  },
  {
    value: RecurringFrequency.DAILY,
    label: t("newDistribution.recurringOptions.daily"),
  },
  {
    value: RecurringFrequency.WEEKLY,
    label: t("newDistribution.recurringOptions.weekly"),
  },
  {
    value: RecurringFrequency.MONTHLY,
    label: t("newDistribution.recurringOptions.monthly"),
  },
];

export const createTriggerConditionOptions = (t: (key: string) => string) => [
  {
    label: t("newDistribution.triggerConditionOptions.onDeposit"),
    value: TriggerCondition.ON_DEPOSIT,
  },
];

export const createAmountTypeOptions = (t: (key: string) => string) => [
  { value: FormAmountType.FIXED, label: t("newDistribution.fixed") },
  { value: FormAmountType.PERCENTAGE, label: t("newDistribution.percentage") },
];
