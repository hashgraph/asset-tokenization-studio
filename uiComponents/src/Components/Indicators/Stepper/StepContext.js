var _a;
// This comes from https://github.com/chakra-ui/chakra-ui/blob/main/packages/components/stepper/src/step-context.tsx
// which is currently not exported from chakra-ui
import { createContext } from "@chakra-ui/react-context";
export var StepContextProvider = (_a = createContext({ name: "StepContext" }), _a[0]), useStepContext = _a[1];
