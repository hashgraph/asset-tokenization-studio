import type { AlertStatus } from "@Components/Overlay/Alert";
export const alertStatusTypeList: AlertStatus[] = [
  "success",
  "warning",
  "error",
  "info",
  "loading",
];

export const isAlertStatus = (obj: any): obj is AlertStatus =>
  typeof obj === "string" && alertStatusTypeList.includes(obj as any);

export const DEFAULT_DURATION = 8000;
