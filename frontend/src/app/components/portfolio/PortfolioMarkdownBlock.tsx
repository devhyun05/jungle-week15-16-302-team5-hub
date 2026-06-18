type MarkdownBlock =
  | {
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "divider";
    };

type PortfolioMarkdownBlockProps = {
  text: string;
  compact?: boolean;
};

function cleanInlineMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function pushParagraph(blocks: MarkdownBlock[], paragraphLines: string[]) {
  const text = cleanInlineMarkdown(paragraphLines.join("\n").trim());

  if (text) {
    blocks.push({ type: "paragraph", text });
  }

  paragraphLines.length = 0;
}

function pushList(blocks: MarkdownBlock[], listItems: string[]) {
  if (listItems.length > 0) {
    blocks.push({ type: "list", items: [...listItems] });
  }

  listItems.length = 0;
}

function parsePortfolioMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const paragraphLines: string[] = [];
  const listItems: string[] = [];

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      pushParagraph(blocks, paragraphLines);
      pushList(blocks, listItems);
      continue;
    }

    if (line === "---") {
      pushParagraph(blocks, paragraphLines);
      pushList(blocks, listItems);
      blocks.push({ type: "divider" });
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);

    if (heading) {
      pushParagraph(blocks, paragraphLines);
      pushList(blocks, listItems);
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        text: cleanInlineMarkdown(heading[2]),
      });
      continue;
    }

    const listItem = /^(?:[-*]|\d+\.)\s+(.+)$/.exec(line);

    if (listItem) {
      pushParagraph(blocks, paragraphLines);
      listItems.push(cleanInlineMarkdown(listItem[1]));
      continue;
    }

    pushList(blocks, listItems);
    paragraphLines.push(rawLine.trimEnd());
  }

  pushParagraph(blocks, paragraphLines);
  pushList(blocks, listItems);

  if (blocks[0]?.type === "paragraph") {
    const [firstLine, ...restLines] = blocks[0].text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (firstLine && restLines.length > 0 && firstLine.length <= 80) {
      blocks.splice(
        0,
        1,
        { type: "heading", level: 1, text: firstLine },
        { type: "paragraph", text: restLines.join("\n") },
      );
    }
  }

  if (blocks[0]?.type === "heading" && blocks[0].level > 1) {
    blocks[0] = {
      ...blocks[0],
      level: 1,
    };
  }

  return blocks;
}

export function PortfolioMarkdownBlock({ text, compact = false }: PortfolioMarkdownBlockProps) {
  const blocks = parsePortfolioMarkdown(text);

  if (blocks.length === 0) {
    return <p className="text-sm leading-7 text-slate-500">아직 작성된 포트폴리오 글이 없습니다.</p>;
  }

  return (
    <div className={compact ? "max-h-80 overflow-hidden space-y-4" : "space-y-5"}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <div
                key={`${block.type}-${index}`}
                className={
                  compact
                    ? "rounded-lg border border-emerald-100 bg-emerald-50/70 px-4 py-3"
                    : "rounded-xl border border-emerald-100 bg-emerald-50/70 px-5 py-4"
                }
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Portfolio</p>
                <h2 className={compact ? "mt-1 text-lg font-bold text-slate-950" : "mt-2 text-2xl font-bold text-slate-950"}>
                  {block.text}
                </h2>
              </div>
            );
          }

          if (block.level === 2) {
            return (
              <h3
                key={`${block.type}-${index}`}
                className={
                  compact
                    ? "border-l-4 border-emerald-400 pl-3 text-base font-bold text-slate-900"
                    : "border-l-4 border-emerald-400 pl-3 text-lg font-bold text-slate-900"
                }
              >
                {block.text}
              </h3>
            );
          }

          return (
            <h4 key={`${block.type}-${index}`} className="rounded-lg border-l-2 border-emerald-300 bg-slate-50/70 px-3 py-2 text-base font-semibold text-slate-800">
              {block.text}
            </h4>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`} className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 px-5 py-4">
              {block.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-7 text-slate-700">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "divider") {
          return <div key={`${block.type}-${index}`} className="h-px bg-slate-100" />;
        }

        return (
          <p
            key={`${block.type}-${index}`}
            className={compact ? "line-clamp-4 whitespace-pre-line text-sm leading-7 text-slate-700" : "whitespace-pre-line text-sm leading-7 text-slate-700"}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
