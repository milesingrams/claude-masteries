"use client";

import { memo, useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { Lexer, Token } from "marked";

// Custom components for ReactMarkdown - minimal overrides, let Tailwind Typography handle most styling
const markdownComponents: Components = {
  // Links - add target blank for external links
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

// Parse markdown into tokens/blocks
function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = Lexer.lex(markdown);
  return tokens.map((token: Token) => token.raw);
}

// Memoized block component - only re-renders if its content changes
const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

// Main memoized markdown component
export function MemoizedMarkdown({
  content,
  id,
}: {
  content: string;
  id: string;
}) {
  // Parse markdown into blocks, memoized to avoid re-parsing on every render
  const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

  return (
    <>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock key={`${id}-block-${index}`} content={block} />
      ))}
    </>
  );
}
