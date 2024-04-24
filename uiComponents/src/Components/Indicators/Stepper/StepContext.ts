// This comes from https://github.com/chakra-ui/chakra-ui/blob/main/packages/components/stepper/src/step-context.tsx
// which is currently not exported from chakra-ui
import { createContext } from "@chakra-ui/react-context";

export type StepStatusType = "active" | "complete" | "incomplete";

export type Orientation = "horizontal" | "vertical";

export interface StepContext {
  status: StepStatusType;
  count: number;
  index: number;
  orientation: Orientation;
  isLast: boolean;
  isFirst: boolean;
  goToNext?(): void;
  goToPrevious?(): void;
  setActiveStep?: React.Dispatch<React.SetStateAction<number>>;
}

export const [StepContextProvider, useStepContext] = createContext<StepContext>(
  { name: "StepContext" }
);
