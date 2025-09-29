import { HStack, VStack, Spacer } from '@chakra-ui/react';
import { Breadcrumb, Tag, Tooltip, Button } from 'io-bricks-ui';
import { GobackButton } from '@/components/GobackButton';
import { ProcessStatus } from '@/types/status';

interface DistributionHeaderProps {
  breadcrumbItems: Array<{ label: string; link: string }>;
  title: string;
  distribution?: {
    status: string;
  };
  onGoBack: () => void;
  onRetryAll: () => void;
  isRetryPending?: boolean;
  t: (key: string) => string;
}

const statusTagMap = {
  COMPLETED: ProcessStatus.COMPLETED,
  FAILED: ProcessStatus.FAILED,
} as const;

const statusVariantMap = {
  COMPLETED: 'success' as const,
  FAILED: 'failed' as const,
} as const;

export const DistributionHeader: React.FC<DistributionHeaderProps> = ({
  breadcrumbItems,
  title,
  distribution,
  onGoBack,
  onRetryAll,
  isRetryPending = false,
  t,
}) => {
  const isFailed = distribution?.status === 'FAILED';

  return (
    <VStack alignItems="left" gap="12px" mb={6}>
      <Breadcrumb items={breadcrumbItems} />
      <HStack align="center" w="full">
        <HStack align="center" spacing={2}>
          <GobackButton label={title} mr={4} onClick={onGoBack} />
          {distribution && (
            <Tooltip
              label={t('failedMessage')}
              placement="bottom"
              bg="neutral.900"
              color="white"
              textStyle="ElementsRegularSM"
            >
              <Tag
                label={
                  statusTagMap[
                    distribution.status as keyof typeof statusTagMap
                  ] || distribution.status
                }
                variant={
                  statusVariantMap[
                    distribution.status as keyof typeof statusVariantMap
                  ] || ''
                }
                size="md"
              />
            </Tooltip>
          )}
        </HStack>
        <Spacer />
        {isFailed && (
          <Button
            variant="primary"
            size="md"
            onClick={onRetryAll}
            isLoading={isRetryPending}
            isDisabled={isRetryPending}
          >
            {t('retryButton')}
          </Button>
        )}
      </HStack>
    </VStack>
  );
};
