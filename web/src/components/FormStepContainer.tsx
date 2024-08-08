import { StackProps, VStack } from "@chakra-ui/react";

export const FormStepContainer = ({ children }: StackProps) => (
  <VStack gap={6} align="flex-start" w="472px" pt={12}>
    {children}
  </VStack>
);
