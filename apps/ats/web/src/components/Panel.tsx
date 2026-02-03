// SPDX-License-Identifier: Apache-2.0

import { StackProps, VStack } from "@chakra-ui/react";
import { PanelTitle } from "io-bricks-ui";

export const Panel = ({ children, title, ...rest }: StackProps) => (
  <VStack layerStyle="container" {...rest}>
    <>
      {title && <PanelTitle title={title} />}
      {children}
    </>
  </VStack>
);
