import React from "react";
import { Box, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { Button } from "@Components/Interaction/Button";
import type { ToastComponentPropsPick } from "@Components/Overlay/Toast";

type ToastComponentProps = ToastComponentPropsPick<
  "status" | "onClose" | "description" | "title"
>;

export function ToastComponent({
  status,
  onClose,
  description,
  title,
}: ToastComponentProps) {
  return (
    <ToastWrapper>
      <Box
        py={4}
        px={12}
        backgroundColor={useColorModeValue(
          "neutral",
          status === "error"
            ? "red.500"
            : status === "success"
            ? "green.500"
            : "neutral.700"
        )}
      >
        <Text fontWeight="500" fontSize="2xl">
          {title}
        </Text>
        <Text
          fontSize="md"
          color={useColorModeValue("neutral.500", "neutral.200")}
        >
          {description}
        </Text>
      </Box>
      <VStack
        bg={useColorModeValue("neutral.50", "neutral.700")}
        py={4}
        borderBottomRadius={"xl"}
      >
        <Box w="80%" pt={7}>
          <Button
            onClick={onClose}
            w="full"
            colorScheme={
              status === "error"
                ? "red"
                : status === "success"
                ? "green"
                : "neutral"
            }
            variant="outline"
          >
            Close
          </Button>
        </Box>
      </VStack>
    </ToastWrapper>
  );
}

function ToastWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center", lg: "flex-start" }}
      borderColor={useColorModeValue("neutral.200", "neutral.500")}
      borderRadius={"xl"}
    >
      {children}
    </Box>
  );
}
