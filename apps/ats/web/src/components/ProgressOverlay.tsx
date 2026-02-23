// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Modal, ModalOverlay, ModalContent, ModalBody, VStack, HStack, Progress, Box } from "@chakra-ui/react";
import { Text, PhosphorIcon, Weight } from "io-bricks-ui";
import { CheckCircle, Circle, Spinner as SpinnerIcon, XCircle } from "@phosphor-icons/react";

export type ProgressStepStatus = "pending" | "in-progress" | "completed" | "error";

export interface ProgressStep {
  id: string;
  label: string;
  status: ProgressStepStatus;
  description?: string;
}

export interface ProgressOverlayProps {
  isOpen: boolean;
  title: string;
  steps: ProgressStep[];
  progress: number;
  description?: string;
}

const STEP_ICONS: Record<ProgressStepStatus, React.ReactNode> = {
  completed: <PhosphorIcon as={CheckCircle} weight={Weight.Fill} color="success.600" />,
  "in-progress": <PhosphorIcon as={SpinnerIcon} weight={Weight.Bold} color="primary.600" />,
  error: <PhosphorIcon as={XCircle} weight={Weight.Fill} color="danger.600" />,
  pending: <PhosphorIcon as={Circle} weight={Weight.Regular} color="neutral.500" />,
};

const STEP_COLORS: Record<ProgressStepStatus, string> = {
  completed: "neutral.900",
  "in-progress": "primary.600",
  error: "danger.600",
  pending: "neutral.500",
};

const getStepIcon = (status: ProgressStepStatus) => STEP_ICONS[status];
const getStepColor = (status: ProgressStepStatus) => STEP_COLORS[status];

export const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ isOpen, title, steps, progress, description }) => {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} closeOnEsc={false} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent bg="neutral.50" borderRadius="8px" boxShadow="xl">
        <ModalBody p={8}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={2} align="stretch">
              <Text textStyle="HeadingBoldXL" color="neutral.900">
                {title}
              </Text>
              {description && (
                <Text textStyle="BodyTextRegularMD" color="neutral.700">
                  {description}
                </Text>
              )}
            </VStack>

            <VStack spacing={2} align="stretch">
              <Progress
                value={progress}
                size="md"
                colorScheme="purple"
                borderRadius="full"
                bg="neutral.200"
                hasStripe
                isAnimated
              />
              <Text textStyle="ElementsRegularSM" color="neutral.600" textAlign="right">
                {Math.round(progress)}%
              </Text>
            </VStack>

            <VStack spacing={3} align="stretch">
              {steps.map((step) => (
                <HStack key={step.id} spacing={3} align="flex-start">
                  <Box mt={0.5}>{getStepIcon(step.status)}</Box>
                  <VStack spacing={0} align="flex-start" flex={1}>
                    <Text textStyle="BodyTextMediumMD" color={getStepColor(step.status)}>
                      {step.label}
                    </Text>
                    {step.description && step.status === "in-progress" && (
                      <Text textStyle="ElementsRegularSM" color="neutral.600">
                        {step.description}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
