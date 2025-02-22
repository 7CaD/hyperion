import { init } from "@structal/form";
import ButtonSelect from "~/components/form/ButtonSelect";

export const { makeStructalForm } = init({
  components: {
    buttonSelect: ButtonSelect,
  },
});
