import { StackProps, VStack } from "@chakra-ui/react";
import { PanelTitle } from "@iob/io-bricks-ui/DataDisplay";

export const Panel = ({ children, title, ...rest }: StackProps) => (
  <VStack layerStyle="container" {...rest}>
    <>
      {title && <PanelTitle title={title} />}
      {children}
    </>
  </VStack>
);
