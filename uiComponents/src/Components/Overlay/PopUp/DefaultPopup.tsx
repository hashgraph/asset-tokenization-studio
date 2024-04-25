import React from "react";
import { PopUpText, PopUpIcon } from "./components";
import { usePopupContext } from "./context/PopupContext";

export const DefaultPopup = () => {
  const { description, title, icon } = usePopupContext();

  return (
    <>
      {icon && <PopUpIcon icon={icon} />}

      {title && <PopUpText label={title} type="title" />}
      {description && <PopUpText label={description} type="description" />}
    </>
  );
};
