// SPDX-License-Identifier: Apache-2.0

import { History } from "../../components/History";
import { useTranslation } from "react-i18next";
import { DigitalSecurityLockerForm } from "./DigitalSecurityLockerForm";

export const DigitalSecurityLocker = () => {
  const { t: tHeader } = useTranslation("security", {
    keyPrefix: "details.locker",
  });

  return (
    <>
      <History label={tHeader("title")} />
      <DigitalSecurityLockerForm />
    </>
  );
};
