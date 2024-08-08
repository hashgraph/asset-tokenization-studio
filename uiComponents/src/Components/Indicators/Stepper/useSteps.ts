import type { UseStepsProps as ChakraUseStepsProps } from "@chakra-ui/stepper";
import { useSteps as useChakraSteps } from "@chakra-ui/stepper";

export const useSteps = (props: ChakraUseStepsProps = {}) => {
  const { ...steps } = useChakraSteps(props);

  return {
    ...steps,
  };
};
