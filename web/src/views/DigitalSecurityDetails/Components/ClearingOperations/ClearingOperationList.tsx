import { Center, Stack, useDisclosure, VStack } from "@chakra-ui/react";
import {
  Button,
  DefinitionList,
  Heading,
  PhosphorIcon,
  PopUp,
} from "io-bricks-ui";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { DATE_TIME_FORMAT } from "../../../../utils/constants";
import { formatDate } from "../../../../utils/format";
import { useSecurityStore } from "../../../../store/securityStore";

const CLEARING_OPERATIONS_MOCK = [
  {
    id: 1,
    operationType: "Transfer",
    amount: "10",
    expirationDate: new Date("10/01/2025"),
    targetId: "0.0.1234567",
  },
  {
    id: 2,
    operationType: "Redeem",
    amount: "15",
    expirationDate: new Date(),
  },
  {
    id: 3,
    operationType: "Hold",
    amount: "20",
    expirationDate: new Date(),
    holdExpirationDate: new Date(),
    sourceId: "0.0.1234567",
    escrowAddress: "0.0.1234567",
    targetId: "0.0.1234567",
  },
];

export const ClearingOperationsList = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const { id: _securityId = "" } = useParams();

  const { details } = useSecurityStore();

  const [_isMutating, setIsMutating] = useState(false);
  const [clearOperationSelected, setClearOperationSelected] =
    useState(undefined);
  const [isReclaiming, setIsReclaiming] = useState(false);

  const { t: tList } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.list",
  });
  const { t: tActions } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.actions.confirmReclaimPopUp",
  });

  const onSubmit = () => {
    setIsMutating(true);

    setIsMutating(false);
  };

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PopUp
        id="confirm-clearing-operation-list-popup"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={WarningCircle} size="md" />}
        title={tActions("title")}
        description={tActions("description")}
        confirmText={tActions("confirmText")}
        cancelText={tActions("cancelText")}
        onConfirm={() => {
          setIsReclaiming(true);
          onSubmit();
          onClose();
        }}
        onCancel={() => {
          setIsReclaiming(false);
          onClose();
        }}
      />
      <Center h="full" bg="neutral.dark.600">
        <VStack align="flex-start" p={6} gap={4}>
          <VStack w={600} align="center" gap={4}>
            <Heading textStyle="HeadingMediumLG">{tList("title")}</Heading>
            <VStack gap={4} w={"full"}>
              {CLEARING_OPERATIONS_MOCK.map((op, index) => {
                const isExpirationDateResearch =
                  Number(op.expirationDate) < Date.now();

                const isReclaimable = isExpirationDateResearch;

                return (
                  <VStack
                    w={"full"}
                    key={index}
                    bgColor={"neutral.white"}
                    py={12}
                    position={"relative"}
                    px={20}
                  >
                    <DefinitionList
                      items={[
                        {
                          title: tList("id"),
                          description: op.id,
                        },
                        {
                          title: tList("amount"),
                          description: op.amount + " " + details?.symbol,
                        },
                        {
                          title: tList("expirationDate"),
                          description: formatDate(
                            Number(op.expirationDate),
                            DATE_TIME_FORMAT,
                          ),
                        },
                        ...(op.targetId
                          ? [
                              {
                                title: tList("targetId"),
                                description: op.targetId,
                              },
                            ]
                          : []),
                        ...(op.escrowAddress
                          ? [
                              {
                                title: tList("escrowAddress"),
                                description: op.escrowAddress,
                              },
                            ]
                          : []),

                        ...(op.sourceId
                          ? [
                              {
                                title: tList("sourceAccount"),
                                description: op.sourceId,
                              },
                            ]
                          : []),
                      ]}
                    />
                    {isReclaimable && (
                      <Button
                        size={"md"}
                        onClick={() => {
                          // @ts-ignore TODO: waiting SDK integration
                          setClearOperationSelected(op);
                          onOpen();
                        }}
                        alignSelf={"end"}
                        disabled={
                          // @ts-ignore TODO: waiting SDK integration
                          isReclaiming && clearOperationSelected?.id === op.id
                        }
                        isLoading={
                          // @ts-ignore TODO: waiting SDK integration
                          isReclaiming && clearOperationSelected?.id === op.id
                        }
                      >
                        Reclaimable
                      </Button>
                    )}
                  </VStack>
                );
              })}
            </VStack>
          </VStack>
        </VStack>
      </Center>
    </Stack>
  );
};
