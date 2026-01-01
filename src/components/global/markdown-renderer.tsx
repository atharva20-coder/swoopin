"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-lg max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom link handling
          a: ({ href, children, ...props }) => {
            const isInternal = href?.startsWith("/");
            if (isInternal) {
              return (
                <Link href={href || "/"} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {children}
                </Link>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          // Custom heading styles
          h1: ({ children }) => (
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              {children}
            </h3>
          ),
          // Paragraph styling
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-neutral-300 leading-relaxed mb-4">
              {children}
            </p>
          ),
          // List styling
          ul: ({ children }) => (
            <ul className="list-disc pl-6 text-gray-700 dark:text-neutral-300 space-y-2 mb-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 text-gray-700 dark:text-neutral-300 space-y-2 mb-4">
              {children}
            </ol>
          ),
          // Blockquote styling
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-6 italic text-gray-600 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-900 rounded-r-lg">
              {children}
            </blockquote>
          ),
          // Code block styling
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-neutral-200">
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`block bg-gray-900 dark:bg-neutral-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4 ${className}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 dark:bg-neutral-950 rounded-lg overflow-x-auto my-4">
              {children}
            </pre>
          ),
          // Table styling
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-gray-200 dark:border-neutral-700">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 dark:border-neutral-700 px-4 py-2 text-gray-700 dark:text-neutral-300">
              {children}
            </td>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-8 border-t border-gray-200 dark:border-neutral-800" />
          ),
          // Strong text
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
          // Image
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ""}
              className="rounded-lg my-6 w-full"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
