/**
 * Gas limits used when deploying contracts.
 */
export const GAS_LIMITS = {
  LifeCycleCashFlow: 3_800_000,
  ProxyAdmin: 450_000,
  Proxy: 610_000,
  Initialize: 1_800_000,
  Fund: 100_000,
  ExecuteDistribution: 300_000,
} as const;

export type DeployableContract = keyof typeof GAS_LIMITS;
