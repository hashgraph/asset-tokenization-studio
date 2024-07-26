import { Button, Center, HStack, Stack, VStack } from "@chakra-ui/react";
import {
  CalendarInputController,
  InputController,
} from "@hashgraph/assettokenization-uicomponents/Forms/Controllers";
import { Info } from "@phosphor-icons/react";
import { required } from "../../../../utils/rules";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SetVotingRightsRequest } from "@hashgraph/assettokenization-sdk";
import { useSetVotingRights } from "../../../../hooks/queries/VotingRights";
import { dateToUnixTimestamp, textToHex } from "../../../../utils/format";
import { PhosphorIcon, Text, Tooltip } from "@hashgraph/assettokenization-uicomponents";

interface ProgramVotingRightsFormValues {
  name: string;
  date: string;
}

export const ProgramVotingRights = () => {
  const { control, formState, handleSubmit, reset } =
    useForm<ProgramVotingRightsFormValues>({
      mode: "all",
    });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.votingRights.program.input",
  });
  const { t: t } = useTranslation("security", {
    keyPrefix: "details.votingRights.program",
  });

  const { id = "" } = useParams();

  const { mutate: setVotingRights, isLoading } = useSetVotingRights();

  const submit: SubmitHandler<ProgramVotingRightsFormValues> = ({
    date,
    name,
  }) => {
    const recordTimestamp = dateToUnixTimestamp(date);
    const data = textToHex(name);

    const setVotingRightsRequest = new SetVotingRightsRequest({
      securityId: id,
      recordTimestamp,
      data,
    });

    setVotingRights(setVotingRightsRequest, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Center h="full" bg="neutral.dark.600">
      <VStack
        as="form"
        onSubmit={handleSubmit(submit)}
        w="500px"
        gap={6}
        py={6}
        data-testid="program-voting-form"
      >
        <Stack w="full">
          <HStack justifySelf="flex-start">
            <Text textStyle="BodyTextRegularSM">{tForm("name.label")}*</Text>
            <Tooltip label={tForm("name.tooltip")} placement="right">
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <InputController
            autoFocus
            control={control}
            id="name"
            rules={{ required }}
            placeholder={tForm("name.placeholder")}
          />
        </Stack>
        <Stack w="full">
          <HStack justifySelf="flex-start">
            <Text textStyle="BodyTextRegularSM">{tForm("date.label")}*</Text>
            <Tooltip label={tForm("date.tooltip")} placement="right">
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <CalendarInputController
            control={control}
            id="date"
            rules={{ required }}
            fromDate={new Date()}
            placeholder={tForm("date.placeholder")}
            withTimeInput
          />
        </Stack>
        <Button
          data-testid="program-vote-button"
          alignSelf="flex-end"
          isLoading={isLoading}
          isDisabled={!formState.isValid}
          type="submit"
        >
          {t("button")}
        </Button>
      </VStack>
    </Center>
  );
};
