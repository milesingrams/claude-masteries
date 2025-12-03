"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

interface InputHeightContextValue {
  inputContainerHeight: number;
  inputContainerRef: RefObject<HTMLDivElement | null>;
}

const InputHeightContext = createContext<InputHeightContextValue | null>(null);

export function InputHeightProvider({ children }: { children: ReactNode }) {
  const [inputContainerHeight, setInputContainerHeight] = useState(0);
  const inputContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = inputContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setInputContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <InputHeightContext.Provider
      value={{ inputContainerHeight, inputContainerRef }}
    >
      {children}
    </InputHeightContext.Provider>
  );
}

export function useInputHeight() {
  const context = useContext(InputHeightContext);
  if (!context) {
    throw new Error("useInputHeight must be used within an InputHeightProvider");
  }
  return context;
}
