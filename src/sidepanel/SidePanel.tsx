import { useState, useEffect } from "react";

import "./SidePanel.css";
import { MainApp } from "~/components/MainApp";
import { Box } from "@chakra-ui/react";
import { selectTab } from "~/models/tabs.models";

export const SidePanel = () => {
  //   const [countSync, setCountSync] = useState(0)
  //   const link = 'https://github.com/guocaoyi/create-chrome-ext'

  //   useEffect(() => {
  //     chrome.storage.sync.get(['count'], (result) => {
  //       setCountSync(result.count || 0)
  //     })

  //     chrome.runtime.onMessage.addListener((request) => {
  //       if (request.type === 'COUNT') {
  //         setCountSync(request.count || 0)
  //       }
  //     })
  //   }, [])

  //   return (
  //     <main>
  //       <h3>SidePanel Page</h3>
  //       <h4>Count from Popup: {countSync}</h4>
  //       <a href={link} target="_blank">
  //         generated by create-chrome-ext
  //       </a>
  //     </main>
  //   )
  return (
    <Box w="100dvw" h="100dvh" position="relative">
      <MainApp
        onEnter={async (selectedTab) => {
          selectTab(selectedTab);
        }}
      />
    </Box>
  );
};

export default SidePanel;
