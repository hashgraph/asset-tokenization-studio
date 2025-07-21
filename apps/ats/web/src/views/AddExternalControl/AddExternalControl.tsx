import { Box, HStack, Stack, VStack } from "@chakra-ui/react";
import { History } from "../../components/History";
import { RouteName } from "../../router/RouteName";
import { useTranslation } from "react-i18next";
import { RoutePath } from "../../router/RoutePath";
import {
  Button,
  InputController,
  SelectController,
  Text,
  useToast,
} from "io-bricks-ui";
import { isHederaValidAddress, required } from "../../utils/rules";
import { useForm } from "react-hook-form";
import { RouterManager } from "../../router/RouterManager";
import { useState } from "react";
import { useExternalControlStore } from "../../store/externalControlStore";

export interface FormValues {
  externalControlId: string;
  type: "whitelist" | "blacklist";
}

export const AddExternalControl = () => {
  const toast = useToast();

  const { t: tRoutes } = useTranslation("routes");

  const { t: tAdd } = useTranslation("externalControl", {
    keyPrefix: "add",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addExternalControl } = useExternalControlStore();

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    addExternalControl({
      address: values.externalControlId,
      type: values.type,
    });

    toast.show({
      status: "success",
      title: tAdd("messages.addExternalControl.success"),
      description: tAdd("messages.addExternalControl.descriptionSuccess"),
    });

    setIsSubmitting(false);

    RouterManager.to(RouteName.ExternalControlList);
  };

  return (
    <Stack gap={6} flex={1}>
      <History
        label={tRoutes(RouteName.AddExternalControl)}
        excludePaths={[RoutePath.DASHBOARD]}
      />
      <Box
        layerStyle={"container"}
        w={"full"}
        h={"full"}
        flex={1}
        alignItems={"center"}
      >
        <Stack
          gap={2}
          alignItems={"start"}
          justifyContent={"center"}
          maxW={500}
          justifySelf={"center"}
        >
          <Text textStyle="HeadingMediumLG">{tAdd("title")}</Text>
          <Text textStyle="BodyTextRegularMD">{tAdd("subtitle")}</Text>
          <Text textStyle="ElementsRegularSM" py={6}>
            {tAdd("mandatoryFields")}
          </Text>
          <Text textStyle="BodyTextRegularSM" mt={4}>
            {tAdd("input.id.label")}
          </Text>
          <VStack w="450px" alignItems="flex-start">
            <InputController
              id="externalControlId"
              control={control}
              placeholder={tAdd("input.id.placeholder")}
              backgroundColor="neutral.white"
              size="md"
              rules={{
                required,
                validate: { isHederaValidAddress },
              }}
            />
          </VStack>
          <Text textStyle="BodyTextRegularSM" mt={4}>
            {tAdd("input.type.label")}
          </Text>
          <VStack w="450px" alignItems="flex-start">
            <SelectController
              id="type"
              control={control}
              placeholder={tAdd("input.type.placeholder")}
              options={[
                {
                  label: "Whitelist",
                  value: "whitelist",
                },
                {
                  label: "Blacklist",
                  value: "blacklist",
                },
              ]}
              rules={{
                required,
              }}
            />
          </VStack>
          <HStack pt={20} justifyContent={"flex-end"} w={"full"}>
            <Button
              variant={"secondary"}
              size={"md"}
              onClick={() => RouterManager.goBack()}
            >
              {tAdd("cancel")}
            </Button>
            <Button
              size={"md"}
              onClick={handleSubmit(onSubmit)}
              isDisabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
            >
              {tAdd("create")}
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Stack>
  );
};
