import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function preloadState<T>(preloadFn: () => Promise<T>) {
  let preloadedVal: Awaited<ReturnType<typeof preloadFn>>;
  const getAllTabsProm = preloadFn().then((val) => {
    preloadedVal = val as Awaited<T>;
    return val;
  });

  function usePreloadState() {
    const [valInt, setValInt] = useState(preloadedVal);
    useEffect(() => {
      (async function () {
        setValInt(await getAllTabsProm);
      })();
    }, []);
    return [valInt, setValInt] as const;
  }

  return usePreloadState;
}

export function useKeyboardSelection({
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  wrap = true,
  onEnter,
  onChange,
  onEsc,
}: {
  min?: number;
  max?: number;
  wrap?: boolean;
  onChange?: (newSelectionIdx: number) => void;
  onEnter?: () => void;
  onEsc?: () => void;
} = {}) {
  const [currentSelection, setSelection] = useState(0);
  const listener = useCallback(
    (e: KeyboardEvent): void => {
      switch (e.key) {
        case "ArrowUp":
          setSelection((curr) => {
            let newVal = curr - 1;
            if (wrap) {
              newVal = (newVal + max) % max;
            } else {
              newVal = Math.max(newVal, min);
            }
            onChange?.(newVal);
            return newVal;
          });
          break;
        case "ArrowDown":
          setSelection((curr) => {
            let newVal = curr + 1;
            if (wrap) {
              newVal = newVal % max;
            } else {
              newVal = Math.min(newVal, max);
            }
            onChange?.(newVal);
            return newVal;
          });
          break;
        case "Enter":
          onEnter?.();
          break;
        case "Escape":
          onEsc?.();
          break;
      }
    },
    [min, max, wrap, onEnter, onChange],
  );
  // useEffect(() => {
  //   if (window) {
  //     window.addEventListener("keydown", listener.current);
  //   }

  //   return () => {
  //     window.removeEventListener("keydown", listener.current);
  //   };
  // }, []);

  return {
    current: currentSelection,
    handle: listener,
    set(arg: number, triggerOnChange = true) {
      if (triggerOnChange) {
        onChange?.(arg);
      }
      setSelection(arg);
    },
  };
}
