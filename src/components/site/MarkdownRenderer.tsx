/**
 * MarkdownRenderer — zero-dependency Markdown renderer for blog post content.
 *
 * Supports:
 *   - Headings (# ## ### ####)
 *   - Bold (**text**), Italic (*text*), Bold+Italic (***text***)
 *   - Inline code (`code`)
 *   - Code blocks (``` ``` with optional language)
 *   - Blockquotes (> text)
 *   - Unordered lists (- item or * item)
 *   - Ordered lists (1. item)
 *   - Horizontal rules (--- or ***)
 *   - Links ([text](url))
 *   - Images (![alt](url))
 *   - Line breaks (blank lines = new paragraph)
 *   - HTML passthrough (when content_format === "html")
 */

import { useMemo, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BlockType =
  | "h1" | "h2" | "h3" | "h4"
  | "blockquote"
  | "code_block"
  | "ul" | "ol"
  | "hr"
  | "paragraph";

interface Block {
  type: BlockType;
  content: string;
  language?: string; // for code_block
  items?: string[];  // for ul / ol
}

// ---------------------------------------------------------------------------
// Parser: string → Block[]
// ---------------------------------------------------------------------------

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line — skip
    if (line.trim() === "") { i++; continue; }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push({ type: "hr", content: "" });
      i++;
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (hMatch) {
      const level = hMatch[1].length as 1 | 2 | 3 | 4;
      blocks.push({ type: `h${level}` as BlockType, content: hMatch[2].trim() });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "blockquote", content: quoteLines.join("\n") });
      continue;
    }

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```
      blocks.push({ type: "code_block", content: codeLines.join("\n"), language: lang || undefined });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s/, "").trim());
        i++;
      }
      blocks.push({ type: "ul", content: "", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, "").trim());
        i++;
      }
      blocks.push({ type: "ol", content: "", items });
      continue;
    }

    // Paragraph — accumulate until blank line or block element
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,4})\s/.test(lines[i]) &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", content: paraLines.join(" ") });
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Inline parser: applies bold, italic, code, links, images
// ---------------------------------------------------------------------------

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Pattern order matters — longer/more-specific first
  const re =
    /!\[([^\]]*)\]\(([^)]+)\)|(?<!\!)\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|_([^_]+)_/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    // Push plain text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const [full, imgAlt, imgSrc, linkText, linkHref, code, boldItalic, bold, italic, bold2, italic2] = match;

    if (imgSrc) {
      // Image
      parts.push(<img key={match.index} src={imgSrc} alt={imgAlt ?? ""} className="my-2 max-w-full rounded-xl" loading="lazy" />);
    } else if (linkHref) {
      // Link
      const isExternal = /^https?:\/\//.test(linkHref);
      parts.push(
        <a
          key={match.index}
          href={linkHref}
          className="font-semibold text-primary underline underline-offset-2 hover:no-underline"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {linkText}
        </a>
      );
    } else if (code) {
      parts.push(
        <code key={match.index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground">
          {code}
        </code>
      );
    } else if (boldItalic) {
      parts.push(<strong key={match.index}><em>{boldItalic}</em></strong>);
    } else if (bold || bold2) {
      parts.push(<strong key={match.index}>{bold ?? bold2}</strong>);
    } else if (italic || italic2) {
      parts.push(<em key={match.index}>{italic ?? italic2}</em>);
    } else {
      parts.push(full);
    }

    lastIndex = match.index + full.length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Block → JSX
// ---------------------------------------------------------------------------

function renderBlock(block: Block, idx: number): ReactNode {
  const key = idx;

  switch (block.type) {
    case "h1":
      return <h1 key={key} className="mb-4 mt-8 font-display text-3xl font-black text-foreground first:mt-0">{parseInline(block.content)}</h1>;
    case "h2":
      return <h2 key={key} className="mb-3 mt-7 font-display text-2xl font-black text-foreground">{parseInline(block.content)}</h2>;
    case "h3":
      return <h3 key={key} className="mb-2 mt-6 font-display text-xl font-bold text-foreground">{parseInline(block.content)}</h3>;
    case "h4":
      return <h4 key={key} className="mb-2 mt-5 font-display text-lg font-bold text-foreground">{parseInline(block.content)}</h4>;

    case "blockquote":
      return (
        <blockquote key={key} className="my-4 border-l-4 border-primary/50 bg-primary/5 py-3 pl-5 pr-4 text-foreground/80 italic">
          {block.content.split("\n").map((line, li) => (
            <p key={li}>{parseInline(line)}</p>
          ))}
        </blockquote>
      );

    case "code_block":
      return (
        <div key={key} className="my-5 overflow-x-auto rounded-2xl border border-border bg-[#0d1117] text-left shadow-sm">
          {block.language && (
            <div className="border-b border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
              {block.language}
            </div>
          )}
          <pre className="p-4">
            <code className="font-mono text-sm leading-relaxed text-[#e6edf3]">{block.content}</code>
          </pre>
        </div>
      );

    case "ul":
      return (
        <ul key={key} className="my-4 space-y-1.5 pl-5">
          {(block.items ?? []).map((item, li) => (
            <li key={li} className="flex items-start gap-2 text-foreground/80">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol key={key} className="my-4 space-y-1.5 pl-5">
          {(block.items ?? []).map((item, li) => (
            <li key={li} className="flex items-start gap-2 text-foreground/80">
              <span className="mt-0.5 shrink-0 font-bold text-primary">{li + 1}.</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ol>
      );

    case "hr":
      return <hr key={key} className="my-8 border-border" />;

    case "paragraph":
    default:
      return (
        <p key={key} className="my-4 leading-relaxed text-foreground/80">
          {parseInline(block.content)}
        </p>
      );
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MarkdownRendererProps {
  content: string;
  /** "markdown" (default) | "html" | "text" */
  format?: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  format = "markdown",
  className = "",
}: MarkdownRendererProps) {
  const rendered = useMemo(() => {
    if (!content) return null;

    // Raw HTML passthrough — trusted admin-entered content only
    if (format === "html") {
      return (
        <div
          className={`prose prose-lg max-w-none ${className}`}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // Plain text — just split on double newlines
    if (format === "text") {
      return (
        <div className={className}>
          {content.split(/\n{2,}/).filter(Boolean).map((p, i) => (
            <p key={i} className="my-4 leading-relaxed text-foreground/80">{p}</p>
          ))}
        </div>
      );
    }

    // Markdown (default)
    const blocks = parse(content);
    return (
      <div className={`max-w-none ${className}`}>
        {blocks.map((b, i) => renderBlock(b, i))}
      </div>
    );
  }, [content, format, className]);

  return rendered;
}
