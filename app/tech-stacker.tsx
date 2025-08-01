"use client";
import { useEffect } from "react";
import getWasm from "shiki/wasm";
import { highlighterAtom } from "./store";
import { useAtom } from "jotai";

import { shikiTheme } from "./store/themes";

import Frame from "./components/Frame";
import Controls from "./components/Controls";
import TechStackSelector from "./components/TechStackSelector";
import FrameContextStore from "./store/FrameContextStore";

import styles from "./code.module.css";
import NoSSR from "./components/NoSSR";

import { Highlighter, getHighlighterCore } from "shiki";
import { LANGUAGES } from "./util/languages";

import tailwindLight from "./assets/tailwind/light.json";
import tailwindDark from "./assets/tailwind/dark.json";
import ExportButton from "./components/ExportButton";
import { NavigationActions } from "@/components/navigation";

export function TechStacker() {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);

  useEffect(() => {
    getHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [LANGUAGES.javascript.src(), LANGUAGES.tsx.src(), LANGUAGES.swift.src(), LANGUAGES.python.src()],
      loadWasm: getWasm,
    }).then((highlighter) => {
      setHighlighter(highlighter as Highlighter);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <FrameContextStore>
        <NavigationActions>
          <ExportButton />
        </NavigationActions>
        <div className={styles.app}>
          <NoSSR>
            <div className={styles.mainContent}>
              {highlighter && <Frame />}
              <Controls />
            </div>
            <TechStackSelector />
          </NoSSR>
        </div>
      </FrameContextStore>
    </>
  );
}
