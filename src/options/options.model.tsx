import { makeStructalForm } from "~/utils/form.utils";

export const { Form: OptionForm } = makeStructalForm({
  fields: ({ buttonSelect }) => ({
    popupType: buttonSelect({
      props: {
        options: [{ value: "Detached" }, { value: "Popup" }],
      },
    }),
  }),
});
