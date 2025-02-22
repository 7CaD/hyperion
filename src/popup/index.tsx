import React from "react";
import ReactDOM from "react-dom/client";
import { Popup } from "./Popup";
import { ColorModeScript } from "@chakra-ui/react";
import { theme } from "~/theme";

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <Popup />
  </React.StrictMode>,
);
