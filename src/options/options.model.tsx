import { makeForm } from "~/utils/form.utils";

export const OptionForm = makeForm({
  fields: ({ buttonSelect }) => ({
    popupType: buttonSelect({
      props: {
        options: [{ value: "Detached" }, { value: "Popup" }],
      },
    }),
  }),
});
