import { ChakraProvider, Container, Text } from "@chakra-ui/react";
import { theme } from "~/theme";
import { OptionForm } from "./options.model";

export const Options = () => {
  return (
    <ChakraProvider theme={theme}>
      <Container mt={24}>
        <Text fontSize="2xl">HYPERION</Text>
        <OptionForm>
          <OptionForm.Field name="popupType"></OptionForm.Field>
        </OptionForm>
      </Container>
    </ChakraProvider>
  );
};

export default Options;
