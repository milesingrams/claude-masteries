import * as React from "react";
import { useEffect, useRef, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

interface AutosizeTextareaProps extends React.ComponentProps<"textarea"> {
  minHeight?: number;
  maxHeight?: number | string;
}

function AutosizeTextarea({
  className,
  minHeight = 60,
  maxHeight = "50vh",
  onChange,
  value,
  ...props
}: AutosizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose the ref to parent components
  useImperativeHandle(
    props.ref as React.Ref<HTMLTextAreaElement | null>,
    () => textareaRef.current
  );

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Convert maxHeight to pixels if it's a string (e.g., "50vh")
    let maxHeightPx: number;
    if (typeof maxHeight === "string") {
      // Create a temporary element to compute the value
      const temp = document.createElement("div");
      temp.style.height = maxHeight;
      temp.style.position = "absolute";
      temp.style.visibility = "hidden";
      document.body.appendChild(temp);
      maxHeightPx = temp.offsetHeight;
      document.body.removeChild(temp);
    } else {
      maxHeightPx = maxHeight;
    }

    // Calculate the new height
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeightPx
    );

    textarea.style.height = `${newHeight}px`;
  };

  // Adjust height when value changes (including programmatic changes)
  useEffect(() => {
    adjustHeight();
  }, [value, minHeight, maxHeight]);

  // Adjust on mount
  useEffect(() => {
    adjustHeight();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    adjustHeight();
  };

  return (
    <textarea
      {...props}
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      data-slot="textarea"
      className={cn("resize-none overflow-y-auto", className)}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: typeof maxHeight === "string" ? maxHeight : `${maxHeight}px`,
        ...props.style,
      }}
    />
  );
}

export { AutosizeTextarea };
export type { AutosizeTextareaProps };
