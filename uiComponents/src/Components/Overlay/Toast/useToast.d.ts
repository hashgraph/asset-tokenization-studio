import { type AlertStatus } from "@Components/Overlay/Alert";
import type { UseToastHook } from "./Toast.types";
export declare function useToast<T extends unknown = AlertStatus>(): UseToastHook<T>;
export { AlertStatus };
