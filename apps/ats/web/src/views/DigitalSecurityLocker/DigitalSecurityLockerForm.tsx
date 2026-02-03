import { Center, HStack, Stack, VStack } from "@chakra-ui/react";
import { Button, CalendarInputController, Heading, InputController, InputNumberController, Text } from "io-bricks-ui";
import { DATE_TIME_FORMAT } from "../../utils/constants";
import { useLocker } from "../../hooks/mutations/useLocker";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LockRequest } from "@hashgraph/asset-tokenization-sdk";
import { dateToUnixTimestamp } from "../../utils/format";
import { isAfterDate, isValidHederaId, min, required } from "../../utils/rules";

interface DigitalSecurityLockerFormValues {
  expirationDate: string;
  targetId: string;
  amount: string;
}

export const DigitalSecurityLockerForm = () => {
  const { id: securityId } = useParams();

  const { t: tLocker } = useTranslation("security", {
    keyPrefix: "details.locker",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.locker.form",
  });
  const { t: tGlobal } = useTranslation("globals");

  const { formState, control, handleSubmit, reset } = useForm<DigitalSecurityLockerFormValues>({
    mode: "onChange",
  });

  const { mutate: lockMutation, isLoading: isLoadingLockMutation } = useLocker();

  const onSubmit = (data: DigitalSecurityLockerFormValues) => {
    const request = new LockRequest({
      securityId: securityId ?? "",
      expirationTimestamp: dateToUnixTimestamp(data.expirationDate),
      amount: data.amount.toString(),
      targetId: data.targetId.toString(),
    });

    lockMutation(request, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Stack w="full" h="full" layerStyle="container">
      <Center w="full" h="full" bg="neutral.dark.600">
        <VStack align={"flex-start"}>
          <Heading textStyle="HeadingMediumLG">{tLocker("title")}</Heading>
          <VStack
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            w="500px"
            gap={6}
            py={6}
            data-testid="balance-adjustment-form"
          >
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tForm("targetId.label")}*</Text>
              </HStack>
              <InputController
                control={control}
                id="targetId"
                rules={{
                  required,
                  validate: { isValidHederaId: isValidHederaId },
                }}
                placeholder={tForm("targetId.placeholder")}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tForm("amount.label")}*</Text>
              </HStack>
              <InputNumberController
                autoFocus
                control={control}
                id="amount"
                rules={{ required, min: min(0) }}
                placeholder={tForm("amount.placeholder")}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tForm("expirationDate.label")}*</Text>
              </HStack>
              <CalendarInputController
                control={control}
                id="expirationDate"
                rules={{
                  required,
                  validate: isAfterDate(new Date(), DATE_TIME_FORMAT),
                }}
                fromDate={new Date()}
                placeholder={tForm("expirationDate.placeholder")}
                withTimeInput
                format={DATE_TIME_FORMAT}
              />
            </Stack>

            <Button
              data-testid="create-locker-button"
              alignSelf="flex-end"
              isLoading={isLoadingLockMutation}
              isDisabled={!formState.isValid}
              type="submit"
            >
              {isLoadingLockMutation ? tGlobal("sending") : tGlobal("send")}
            </Button>
          </VStack>
        </VStack>
      </Center>
    </Stack>
  );
};
