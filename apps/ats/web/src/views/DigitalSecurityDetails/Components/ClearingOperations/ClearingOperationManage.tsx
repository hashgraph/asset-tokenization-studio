import { Center, HStack, Stack, useDisclosure, VStack } from '@chakra-ui/react';
import {
  Button,
  Heading,
  InputController,
  PhosphorIcon,
  PopUp,
  SelectController,
  Text,
} from 'io-bricks-ui';
import { isValidHederaId, required } from '../../../../utils/rules';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { WarningCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import {
  useApproveClearingByPartition,
  useCancelClearingByPartition,
} from '../../../../hooks/mutations/useClearingOperations';
import {
  ApproveClearingOperationByPartitionRequest,
  CancelClearingOperationByPartitionRequest,
} from '@hashgraph/asset-tokenization-sdk';
import { DEFAULT_PARTITION } from '../../../../utils/constants';

enum ManageOperationType {
  APPROVE = 'Approve',
  CANCEL = 'Cancel',
}

enum ClearingOperationType {
  TRANSFER = 'Transfer',
  REDEEM = 'Redeem',
  HOLD = 'Hold',
}

const clearingOperationTypeToNumber = {
  [ClearingOperationType.TRANSFER]: 0,
  [ClearingOperationType.REDEEM]: 1,
  [ClearingOperationType.HOLD]: 2,
};

interface FormValues {
  operationType: keyof typeof ManageOperationType;
  clearingOperationId: string;
  clearingOperationType: ClearingOperationType;
  sourceId: string;
}

export const ClearingOperationsManage = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const { id: securityId = '' } = useParams();

  const [isMutating, setIsMutating] = useState(false);

  const { t: tManage } = useTranslation('security', {
    keyPrefix: 'details.clearingOperations.manage',
  });
  const { t: tForm } = useTranslation('security', {
    keyPrefix: 'details.clearingOperations.manage.form',
  });
  const { t: tActions } = useTranslation('security', {
    keyPrefix: 'details.clearingOperations.actions.confirmManage',
  });
  const { t: tGlobal } = useTranslation('globals');

  const { control, formState, getValues, reset } = useForm<FormValues>({
    mode: 'onChange',
  });

  const { mutate: approveClearing } = useApproveClearingByPartition();
  const { mutate: cancelClearing } = useCancelClearingByPartition();

  const onSubmit = () => {
    setIsMutating(true);

    const {
      clearingOperationId,
      sourceId,
      operationType,
      clearingOperationType,
    } = getValues();

    const clearingOperationTypeIndex =
      clearingOperationTypeToNumber[clearingOperationType];

    if (operationType === ManageOperationType.APPROVE.valueOf()) {
      const request = new ApproveClearingOperationByPartitionRequest({
        clearingId: Number(clearingOperationId),
        clearingOperationType: clearingOperationTypeIndex,
        partitionId: DEFAULT_PARTITION,
        securityId,
        targetId: sourceId,
      });

      approveClearing(request, {
        onSettled() {
          setIsMutating(false);
        },
        onSuccess() {
          reset();
        },
      });

      return;
    }

    if (operationType === ManageOperationType.CANCEL.valueOf()) {
      const request = new CancelClearingOperationByPartitionRequest({
        clearingId: Number(clearingOperationId),
        clearingOperationType: clearingOperationTypeIndex,
        partitionId: DEFAULT_PARTITION,
        securityId,
        targetId: sourceId,
      });

      cancelClearing(request, {
        onSettled() {
          setIsMutating(false);
        },
        onSuccess() {
          reset();
        },
      });

      return;
    }
  };

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PopUp
        id="confirm-clearing-operation-manage-popup"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={WarningCircle} size="md" />}
        title={tActions('title')}
        description={tActions('description')}
        confirmText={tActions('confirmText')}
        cancelText={tActions('cancelText')}
        onConfirm={() => {
          onSubmit();
          onClose();
        }}
        onCancel={() => {
          onClose();
        }}
      />
      <Center w="full" h="full" bg="neutral.dark.600">
        <VStack align="flex-start" p={6} gap={4}>
          <VStack align="flex-start" gap={0}>
            <Heading textStyle="HeadingMediumLG">{tManage('title')}</Heading>
          </VStack>
          <VStack
            as="form"
            onSubmit={() => {
              onOpen();
            }}
            w="500px"
            gap={6}
            py={6}
            data-testid="manage-clearing-operation-form"
          >
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm('operationType.label')}*
                </Text>
              </HStack>
              <SelectController
                id="operationType"
                control={control}
                rules={{ required }}
                options={[
                  {
                    value: ManageOperationType.APPROVE,
                    label: ManageOperationType.APPROVE,
                  },
                  {
                    value: ManageOperationType.CANCEL,
                    label: ManageOperationType.CANCEL,
                  },
                ]}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm('clearingOperationId.label')}*
                </Text>
              </HStack>
              <InputController
                control={control}
                id="clearingOperationId"
                placeholder={tForm('clearingOperationId.placeholder')}
                isRequired={true}
                rules={{
                  required,
                }}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm('clearingOperationType.label')}*
                </Text>
              </HStack>
              <SelectController
                id="clearingOperationType"
                control={control}
                rules={{ required }}
                options={[
                  {
                    value: ClearingOperationType.TRANSFER,
                    label: ClearingOperationType.TRANSFER,
                  },
                  {
                    value: ClearingOperationType.REDEEM,
                    label: ClearingOperationType.REDEEM,
                  },
                  {
                    value: ClearingOperationType.HOLD,
                    label: ClearingOperationType.HOLD,
                  },
                ]}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm('sourceId.label')}
                </Text>
              </HStack>
              <InputController
                control={control}
                id="sourceId"
                placeholder={tForm('sourceId.placeholder')}
                isRequired={true}
                rules={{
                  required,
                  validate: { isValidHederaId: isValidHederaId },
                }}
              />
            </Stack>

            <Button
              data-testid="manage-clean-operations-button"
              alignSelf="flex-end"
              isLoading={isMutating}
              isDisabled={!formState.isValid || isMutating}
              onClick={() => {
                onOpen();
              }}
            >
              {tGlobal('execute')}
            </Button>
          </VStack>
        </VStack>
      </Center>
    </Stack>
  );
};
