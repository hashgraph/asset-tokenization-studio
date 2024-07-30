import { Box, HStack, Stack } from "@chakra-ui/react";
import { StepTokenDetails } from "./Components/StepTokenDetails";
import { FormProvider, useForm } from "react-hook-form";
import {
  useSteps,
  Wizard,
} from "@hashgraph/assettokenization-uicomponents/Indicators";
import { useTranslation } from "react-i18next";
import { History } from "../../components/History";
import { RouteName } from "../../router/RouteName";
import { ICreateBondFormValues } from "./ICreateBondFormValues";
import { useEffect } from "react";
import { User } from "../../utils/constants";
import { useUserStore } from "../../store/userStore";
import { StepConfiguration } from "./Components/StepConfiguration";
import { StepReview } from "./Components/StepReview";
import { StepCoupon } from "./Components/StepCoupon";
import { StepRegulation } from "../CreateSecurityCommons/StepRegulation";

export const CreateBond = () => {
  const { t } = useTranslation("security", { keyPrefix: "createBond" });
  const { t: tRoutes } = useTranslation("routes");
  const { setType } = useUserStore();

  const steps = useSteps();
  const form = useForm<ICreateBondFormValues>({
    mode: "all",
    defaultValues: {
      isControllable: true,
      isBlocklist: true,
      isApproval: false,
      regulationType: 1,
      regulationSubType: 0,
      countriesListType: 1,
      countriesList: [] as string[],
    },
  });

  const wizardSteps = [
    {
      title: t("header.details"),
      content: <StepTokenDetails />,
    },
    {
      title: t("header.configuration"),
      content: <StepConfiguration />,
    },
    {
      title: t("header.coupon"),
      content: <StepCoupon />,
    },
    {
      title: t("header.regulation"),
      content: <StepRegulation />,
    },
    {
      title: t("header.review"),
      content: <StepReview />,
    },
  ];

  useEffect(() => {
    setType(User.admin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Stack gap={6}>
        <History label={tRoutes(RouteName.CreateBond)} />

        <HStack
          w="full"
          h="full"
          bg="neutral.50"
          padding={4}
          p={4}
          pb={10}
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <Box
            as="form"
            data-testid="create-equity-form"
            layerStyle="container"
          >
            <FormProvider {...form}>
              <Wizard
                // @ts-ignore
                steps={wizardSteps}
                {...steps}
              />
            </FormProvider>
          </Box>
        </HStack>
      </Stack>
    </>
  );
};
