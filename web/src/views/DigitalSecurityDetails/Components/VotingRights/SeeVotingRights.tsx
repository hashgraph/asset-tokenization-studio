import { Button, Center, HStack, Stack, VStack } from "@chakra-ui/react";
import {
  InputController,
  InputNumberController,
} from "@iob/io-bricks-ui/Forms/Controllers";
import {
  isHederaValidAddress,
  required,
  greaterThanZero,
} from "../../../../utils/rules";
import { Info } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  useGetVotingRights,
  useGetVotingRightsFor,
} from "../../../../hooks/queries/VotingRights";
import {
  GetVotingRightsForRequest,
  GetVotingRightsRequest,
} from "@iob/securitytoken-sdk";
import { useParams } from "react-router-dom";
import { PhosphorIcon, Text } from "@iob/io-bricks-ui/Foundations";
import { Panel } from "../../../../components/Panel";
import { hexToText } from "../../../../utils/format";
import { Tooltip } from "@iob/io-bricks-ui";

interface SeeVotingRightsFormValues {
  votingId: number;
  accountId: string;
}

export const SeeVotingRights = () => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
    watch,
  } = useForm<SeeVotingRightsFormValues>({
    mode: "all",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.votingRights.see.input",
  });
  const { t: tGlobal } = useTranslation("globals");
  const { t: tDetails } = useTranslation("security", {
    keyPrefix: "details.votingRights.see.details",
  });
  const { id = "" } = useParams();
  const accountId = watch("accountId");
  const votingId = watch("votingId");

  const getVotingRightsForRequest = new GetVotingRightsForRequest({
    securityId: id,
    targetId: accountId,
    votingId,
  });

  const {
    data: votingRightsFor,
    refetch: refetchGetVotingRightsFor,
    isFetching: isGetVotingRightsForFetching,
  } = useGetVotingRightsFor(getVotingRightsForRequest, {
    enabled: false,
  });

  const getVotingRightsRequest = new GetVotingRightsRequest({
    securityId: id,
    votingId,
  });

  const {
    data: votingRights,
    refetch: refetchGetVotingRights,
    isFetching: isGetVotingRightsFetching,
  } = useGetVotingRights(getVotingRightsRequest, {
    enabled: false,
  });

  const submitForm = () => {
    refetchGetVotingRightsFor();
    refetchGetVotingRights();
  };

  const votingIsPending = new Date(votingRights?.recordDate ?? "") < new Date();

  return (
    <Center h="full" bg="neutral.dark.600">
      <VStack>
        <VStack
          as="form"
          w="500px"
          gap={6}
          py={6}
          data-testid="see-voting-rights-form"
          onSubmit={handleSubmit(submitForm)}
        >
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">
                {tForm("voting.label")}*
              </Text>
              <Tooltip label={tForm("voting.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <InputNumberController
              control={control}
              id="votingId"
              rules={{
                required,
                validate: {
                  min: greaterThanZero,
                },
              }}
              placeholder={tForm("voting.placeholder")}
            />
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">
                {tForm("account.label")}*
              </Text>
              <Tooltip label={tForm("account.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <InputController
              control={control}
              id="accountId"
              rules={{ required, isHederaValidAddress }}
              placeholder={tForm("account.placeholder")}
            />
          </Stack>
          <Button
            alignSelf="flex-end"
            data-testid="check-button"
            isDisabled={!isValid}
            isLoading={
              isGetVotingRightsForFetching || isGetVotingRightsFetching
            }
            type="submit"
          >
            {tGlobal("check")}
          </Button>
        </VStack>
        {votingRights && votingRightsFor && (
          <Panel
            title={tDetails("title", { name: hexToText(votingRights.data) })}
          >
            <Center w="full">
              <Text textStyle="ElementsSemibold2XL">
                {votingIsPending
                  ? tDetails("pending")
                  : tDetails("number", { number: votingRightsFor.value })}
              </Text>
            </Center>
          </Panel>
        )}
      </VStack>
    </Center>
  );
};
