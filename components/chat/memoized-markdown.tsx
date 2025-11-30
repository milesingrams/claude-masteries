"use client";

import { memo, useMemo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { Lexer, Token } from "marked";

// Custom components for ReactMarkdown with styling
const markdownComponents: Components = {
  // Headings
  h1: ({ children }) => (
    <h1 className="mb-4 mt-6 text-2xl font-bold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-5 text-xl font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h4>
  ),
  // Paragraphs
  p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
  // Lists
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-6">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  // Code
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
          {children}
        </code>
      );
    }
    return (
      <code className="block overflow-x-auto font-mono text-sm">{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-muted mb-3 overflow-x-auto rounded-lg p-4 font-mono text-sm">
      {children}
    </pre>
  ),
  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-muted-foreground/30 mb-3 border-l-4 pl-4 italic">
      {children}
    </blockquote>
  ),
  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  // Horizontal rule
  hr: () => <hr className="border-border my-4" />,
  // Strong and emphasis
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  // Tables
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="border-border min-w-full border-collapse border">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-border border-b">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="border-border border px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-border border px-3 py-2">{children}</td>
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
    return <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>;
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

