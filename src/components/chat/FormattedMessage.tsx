'use client';

import React from 'react';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

export function FormattedMessage({ content, className = '' }: FormattedMessageProps) {
  // Parse and format the content
  const formatContent = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent = '';

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-1.5 my-3">
            {currentList}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="bg-slate-800 text-slate-100 rounded-lg p-4 my-3 overflow-x-auto text-sm font-mono">
              <code>{codeBlockContent.trim()}</code>
            </pre>
          );
          codeBlockContent = '';
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        return;
      }

      // Skip empty lines but flush list if needed
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Handle headers (e.g., "**Introduction to YOLO [Document 2]**")
      const headerMatch = trimmedLine.match(/^\*\*(.+?)\*\*$/);
      if (headerMatch) {
        flushList();
        elements.push(
          <h3 key={`h-${index}`} className="text-base font-bold text-slate-900 mt-5 mb-2">
            {headerMatch[1]}
          </h3>
        );
        return;
      }

      // Handle bullet points
      const bulletMatch = trimmedLine.match(/^(\s*)[*\-•]\s+(.+)$/);
      if (bulletMatch) {
        const indent = bulletMatch[1].length;
        const text = bulletMatch[2];
        const formattedText = parseInlineFormatting(text);

        currentList.push(
          <li 
            key={`li-${index}`} 
            className={`flex gap-2 ${indent > 0 ? 'ml-6' : ''}`}
          >
            <span className="text-[var(--primary-500)] mt-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-current block" />
            </span>
            <span className="text-sm leading-relaxed text-slate-700">{formattedText}</span>
          </li>
        );
        return;
      }

      // Handle numbered lists
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        flushList();
        const formattedText = parseInlineFormatting(numberedMatch[2]);
        elements.push(
          <div key={`num-${index}`} className="flex gap-2 my-1.5">
            <span className="text-sm font-medium text-[var(--primary-500)] min-w-[1.5rem]">
              {numberedMatch[1]}.
            </span>
            <span className="text-sm leading-relaxed text-slate-700">{formattedText}</span>
          </div>
        );
        return;
      }

      // Handle bold label with content (e.g., "**Confidence Score:** C = P(object)...")
      const boldLabelMatch = trimmedLine.match(/^(\s*)\*\*\s*(.+?)\s*:\s*\*\*\s*(.+)$/);
      if (boldLabelMatch) {
        flushList();
        const label = boldLabelMatch[2];
        const content = parseInlineFormatting(boldLabelMatch[3]);
        elements.push(
          <div key={`sub-${index}`} className={`my-2 ${boldLabelMatch[1] ? 'ml-6' : ''}`}>
            <span className="text-sm font-semibold text-slate-900">{label}:</span>{' '}
            <span className="text-sm text-slate-700">{content}</span>
          </div>
        );
        return;
      }

      // Regular paragraph
      flushList();
      const formattedText = parseInlineFormatting(trimmedLine);
      elements.push(
        <p key={`p-${index}`} className="text-sm leading-relaxed text-slate-700 my-2">
          {formattedText}
        </p>
      );
    });

    flushList();
    return elements;
  };

  // Parse inline formatting (bold, document citations, code)
  const parseInlineFormatting = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Check for bold text
      const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
      if (boldMatch) {
        if (boldMatch[1]) {
          parts.push(<span key={key++}>{boldMatch[1]}</span>);
        }
        parts.push(
          <strong key={key++} className="font-semibold text-slate-900">
            {boldMatch[2]}
          </strong>
        );
        remaining = boldMatch[3];
        continue;
      }

      // Check for document citations [Document X]
      const docMatch = remaining.match(/^(.*?)\[Document\s*(\d+)\](.*)$/);
      if (docMatch) {
        if (docMatch[1]) {
          parts.push(<span key={key++}>{docMatch[1]}</span>);
        }
        parts.push(
          <span 
            key={key++} 
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-[var(--primary-100)] text-[var(--primary-700)]"
          >
            Doc {docMatch[2]}
          </span>
        );
        remaining = docMatch[3];
        continue;
      }

      // Check for inline code
      const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/);
      if (codeMatch) {
        if (codeMatch[1]) {
          parts.push(<span key={key++}>{codeMatch[1]}</span>);
        }
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-800">
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
        continue;
      }

      // No more formatting found
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    return parts.length === 1 ? parts[0] : parts;
  };

  return (
    <div className={`formatted-message ${className}`}>
      {formatContent(content)}
    </div>
  );
}
