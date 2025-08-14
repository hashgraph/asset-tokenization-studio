import { Center, Box, Text, SkeletonText } from '@chakra-ui/react';
import { Panel } from '../../../../../components/Panel';
import { useTranslation } from 'react-i18next';
import { formatNumberLocale, toNumber } from '../../../../../utils/format';
import { SecurityViewModel } from '@hashgraph/asset-tokenization-sdk';
import { EquityDetailsViewModel } from '@hashgraph/asset-tokenization-sdk';
import { BondDetailsViewModel } from '@hashgraph/asset-tokenization-sdk';
import { useMemo } from 'react';

interface DetailsTotalSupplyProps {
  detailsResponse: SecurityViewModel;
  equityDetailsResponse?: EquityDetailsViewModel;
  bondDetailsResponse?: BondDetailsViewModel;
}

export const DetailsTotalSupply = ({
  detailsResponse,
  equityDetailsResponse,
  bondDetailsResponse,
}: DetailsTotalSupplyProps) => {
  const { t: tProperties } = useTranslation('properties');

  const nominalValue = useMemo(() => {
    return toNumber(
      equityDetailsResponse?.nominalValue || bondDetailsResponse?.nominalValue,
      2,
    );
  }, [equityDetailsResponse, bondDetailsResponse]);

  const nominalTotalValue = useMemo(() => {
    return formatNumberLocale(
      nominalValue * ((detailsResponse?.totalSupply ?? 0) as number),
      2,
    );
  }, [nominalValue, detailsResponse]);

  return (
    <Panel title={tProperties('totalSupply')}>
      <Center w="full">
        {detailsResponse &&
        (equityDetailsResponse?.nominalValue !== undefined ||
          bondDetailsResponse?.nominalValue !== undefined) ? (
          <Box>
            <Text textStyle="ElementsSemibold2XL">
              {detailsResponse?.totalSupply ?? ''}
              <Text ml={1} as="span" textStyle="ElementsRegularMD">
                {detailsResponse?.symbol ?? ''}
              </Text>
            </Text>
            <Text ml={1} as="span" textStyle="ElementsRegularMD">
              {tProperties('nominalTotalValue')}
              {nominalTotalValue}
            </Text>
          </Box>
        ) : (
          <SkeletonText skeletonHeight={2} flex={1} noOfLines={1} />
        )}
      </Center>
    </Panel>
  );
};
