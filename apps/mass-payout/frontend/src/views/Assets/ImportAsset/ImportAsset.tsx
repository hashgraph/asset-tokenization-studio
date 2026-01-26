// SPDX-License-Identifier: Apache-2.0

import { FormProvider, useForm } from "react-hook-form";
import { useSteps } from "io-bricks-ui";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import { ImportHeader } from "./components/ImportHeader";
import { WizardConfiguration } from "./components/WizardConfiguration";

export interface ImportAssetFormValues {
  assetId: string;
  assetName: string;
  assetSymbol: string;
  assetType: string;
}

export const ImportAsset = () => {
  const routes = useBreadcrumbs({});

  const steps = useSteps();
  const form = useForm<ImportAssetFormValues>({
    mode: "all",
    defaultValues: {
      assetId: "",
      assetName: "",
    },
  });

  return (
    <>
      <ImportHeader breadcrumbs={routes} />
      <FormProvider {...form}>
        <WizardConfiguration form={form} steps={steps} />
      </FormProvider>
    </>
  );
};
