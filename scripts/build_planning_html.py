#!/usr/bin/env python3
"""Build a focused daily planning HTML page from planning markdown files.

The generated HTML contains the day contents directly in the document body,
so schedules remain visible even if JavaScript is unavailable.
"""

from __future__ import annotations

import hashlib
import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLANNING_DIR = ROOT / "docs" / "planning"
SCHEDULE_PATH = PLANNING_DIR / "schedule.md"
TASK_LIST_PATH = PLANNING_DIR / "task-list.md"
OUTPUT_PATH = PLANNING_DIR / "index.html"

DAY_HEADING_RE = re.compile(r"^## Day\s+(\d+)\s+-\s+(.+)$", re.MULTILINE)
SECTION_HEADING_RE = re.compile(r"^##\s+(.+)$", re.MULTILINE)


def stable_id(text: str) -> str:
    return "c_" + hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]


def search_attr(text: str) -> str:
    return html.escape(" ".join(text.lower().split()))


def inline_markdown(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        r'<a href="\2" target="_blank" rel="noreferrer">\1</a>',
        escaped,
    )
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    return escaped


def render_table(lines: list[str]) -> str:
    rows = [[inline_markdown(cell.strip()) for cell in line.strip().strip("|").split("|")] for line in lines]
    if len(rows) < 2:
        return ""
    header = rows[0]
    body = rows[2:] if len(rows) > 2 and set("".join(rows[1])) <= {"-", ":", " "} else rows[1:]
    head = "".join(f"<th>{cell}</th>" for cell in header)
    body_html = "".join(
        "<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>" for row in body
    )
    return f'<div class="table-wrap"><table><thead><tr>{head}</tr></thead><tbody>{body_html}</tbody></table></div>'


def render_markdown(markdown: str, *, interactive_checks: bool = False, key_prefix: str = "") -> str:
    lines = markdown.splitlines()
    output: list[str] = []
    paragraph: list[str] = []
    list_stack: list[str] = []
    table_lines: list[str] = []
    code_lines: list[str] = []
    in_code = False
    code_lang = ""

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            output.append(f"<p>{inline_markdown(' '.join(paragraph))}</p>")
            paragraph = []

    def close_lists(target_depth: int = 0) -> None:
        while len(list_stack) > target_depth:
            output.append(f"</{list_stack.pop()}>")

    def flush_table() -> None:
        nonlocal table_lines
        if table_lines:
            output.append(render_table(table_lines))
            table_lines = []

    for raw_line in lines:
        line = raw_line.rstrip()

        if line.startswith("```"):
            flush_paragraph()
            flush_table()
            close_lists()
            if in_code:
                code = html.escape("\n".join(code_lines))
                lang = f' class="language-{html.escape(code_lang)}"' if code_lang else ""
                output.append(f"<pre><code{lang}>{code}</code></pre>")
                code_lines = []
                code_lang = ""
                in_code = False
            else:
                code_lang = line[3:].strip()
                in_code = True
            continue

        if in_code:
            code_lines.append(raw_line)
            continue

        if line.startswith("|") and line.endswith("|"):
            flush_paragraph()
            close_lists()
            table_lines.append(line)
            continue
        flush_table()

        if not line.strip():
            flush_paragraph()
            close_lists()
            continue

        heading = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading:
            flush_paragraph()
            close_lists()
            level = min(len(heading.group(1)) + 1, 6)
            output.append(f"<h{level}>{inline_markdown(heading.group(2))}</h{level}>")
            continue

        checkbox = re.match(r"^(\s*)-\s+\[([ xX])\]\s+(.+)$", raw_line)
        bullet = re.match(r"^(\s*)-\s+(.+)$", raw_line)
        ordered = re.match(r"^(\s*)\d+\.\s+(.+)$", raw_line)
        if checkbox or bullet or ordered:
            flush_paragraph()
            indent = len((checkbox or bullet or ordered).group(1))
            depth = indent // 2 + 1
            list_type = "ol" if ordered else "ul"
            while len(list_stack) > depth:
                output.append(f"</{list_stack.pop()}>")
            if len(list_stack) == depth and list_stack[-1] != list_type:
                output.append(f"</{list_stack.pop()}>")
            while len(list_stack) < depth:
                list_stack.append(list_type)
                output.append(f"<{list_type}>")

            if checkbox:
                body = checkbox.group(3).strip()
                checked = " checked" if checkbox.group(2).lower() == "x" else ""
                disabled = "" if interactive_checks else " disabled"
                check_id = stable_id(f"{key_prefix}:{body}")
                output.append(
                    '<li class="check-item">'
                    f'<label><input type="checkbox" data-check-id="{check_id}"{checked}{disabled}> '
                    f"<span>{inline_markdown(body)}</span></label></li>"
                )
            else:
                body = (bullet or ordered).group(2).strip()
                output.append(f"<li>{inline_markdown(body)}</li>")
            continue

        paragraph.append(line.strip())

    flush_paragraph()
    flush_table()
    close_lists()
    return "\n".join(output)


def parse_days(markdown: str) -> list[dict[str, str]]:
    matches = list(DAY_HEADING_RE.finditer(markdown))
    days: list[dict[str, str]] = []
    for index, match in enumerate(matches):
        next_start = matches[index + 1].start() if index + 1 < len(matches) else len(markdown)
        block = markdown[match.start() : next_start].strip()
        footer_match = re.search(r"\n## (필수|매일)\s", block)
        if footer_match:
            block = block[: footer_match.start()].strip()
        days.append(
            {
                "number": match.group(1),
                "title": match.group(2).strip(),
                "plain": block,
                "html": render_markdown(block),
            }
        )
    return days


def parse_task_sections(markdown: str) -> list[dict[str, str]]:
    matches = list(SECTION_HEADING_RE.finditer(markdown))
    sections: list[dict[str, str]] = []
    for index, match in enumerate(matches):
        next_start = matches[index + 1].start() if index + 1 < len(matches) else len(markdown)
        block = markdown[match.start() : next_start].strip()
        title = match.group(1).strip()
        sections.append(
            {
                "title": title,
                "plain": block,
                "html": render_markdown(block, interactive_checks=True, key_prefix=title),
            }
        )
    return sections


def build_day_nav(days: list[dict[str, str]]) -> str:
    buttons = []
    for day in days:
        buttons.append(
            f'<label class="day-btn" for="day-toggle-{day["number"]}" data-day="{day["number"]}">'
            f'<strong>Day {day["number"]}</strong><span>{html.escape(day["title"])}</span></label>'
        )
    return "\n".join(buttons)


def build_day_controls(days: list[dict[str, str]]) -> str:
    controls = []
    for index, day in enumerate(days):
        checked = " checked" if index == 0 else ""
        controls.append(
            f'<input class="control-radio" type="radio" name="daySelect" '
            f'id="day-toggle-{day["number"]}" value="{day["number"]}"{checked}>'
        )
    return "\n".join(controls)


def build_day_css(days: list[dict[str, str]]) -> str:
    show_rules = []
    active_rules = []
    for day in days:
        number = day["number"]
        show_rules.append(f'#day-toggle-{number}:checked ~ .layout #day-card-{number}')
        active_rules.append(f'#day-toggle-{number}:checked ~ .layout label[for="day-toggle-{number}"]')
    return f"""
    {", ".join(show_rules)} {{
      display: block;
    }}
    {", ".join(active_rules)} {{
      color: #fff;
      border-color: var(--accent);
      background: var(--accent);
    }}
    {", ".join(active_rules)} span {{
      color: rgba(255,255,255,0.82);
    }}
"""


def build_day_cards(days: list[dict[str, str]]) -> str:
    cards = []
    for day in days:
        cards.append(
            f'<article id="day-card-{day["number"]}" class="panel doc day-card" data-day="{day["number"]}" '
            f'data-search="{search_attr(day["title"] + " " + day["plain"])}">'
            f'{day["html"]}</article>'
        )
    return "\n".join(cards)


def build_task_cards(sections: list[dict[str, str]]) -> str:
    cards = []
    for index, section in enumerate(sections):
        open_attr = " open" if index < 3 else ""
        cards.append(
            f'<details class="task-section"{open_attr} data-search="{search_attr(section["title"] + " " + section["plain"])}">'
            f'<summary>{html.escape(section["title"])}</summary>'
            f'<div class="doc">{section["html"]}</div></details>'
        )
    return "\n".join(cards)


def build_html() -> str:
    days = parse_days(SCHEDULE_PATH.read_text(encoding="utf-8"))
    task_sections = parse_task_sections(TASK_LIST_PATH.read_text(encoding="utf-8"))
    day_controls = build_day_controls(days)
    day_css = build_day_css(days)
    day_nav = build_day_nav(days)
    day_cards = build_day_cards(days)
    task_cards = build_task_cards(task_sections)

    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Board Daily Plan</title>
  <style>
    :root {{
      --bg: #f6f8fb;
      --panel: #fff;
      --text: #111827;
      --muted: #667085;
      --line: #d9e0ea;
      --accent: #0f766e;
      --code: #eef2f7;
      --shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.65;
    }}
    .control-radio {{
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }}
    .layout {{
      min-height: 100vh;
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
    }}
    .sidebar {{
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: auto;
      background: #fbfcfe;
      border-right: 1px solid var(--line);
      padding: 22px 16px;
    }}
    .brand h1 {{
      margin: 0;
      font-size: 22px;
      line-height: 1.2;
    }}
    .brand p {{
      margin: 8px 0 18px;
      color: var(--muted);
      font-size: 14px;
    }}
    .tabs {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 16px;
    }}
    button, .tab-label, .day-btn {{
      border: 1px solid var(--line);
      background: #fff;
      color: var(--text);
      border-radius: 8px;
      min-height: 40px;
      padding: 8px 12px;
      font: inherit;
      cursor: pointer;
      user-select: none;
    }}
    button:hover, button:focus-visible, .tab-label:hover, .day-btn:hover {{
      border-color: var(--accent);
      outline: none;
    }}
    button.active, .tab-label.active, .day-btn.active,
    #view-daily:checked ~ .layout label[for="view-daily"],
    #view-flow:checked ~ .layout label[for="view-flow"] {{
      color: #fff;
      border-color: var(--accent);
      background: var(--accent);
    }}
    .tab-label {{
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
    }}
    .day-nav {{
      display: grid;
      gap: 8px;
    }}
    .day-btn {{
      text-align: left;
      display: grid;
      gap: 2px;
    }}
    .day-btn strong {{
      font-size: 13px;
    }}
    .day-btn span {{
      color: var(--muted);
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }}
    .day-btn.active span {{
      color: rgba(255,255,255,0.82);
    }}
    .day-card {{
      display: none;
    }}
    #flowView {{
      display: none;
    }}
    #view-flow:checked ~ .layout #dailyView {{
      display: none;
    }}
    #view-flow:checked ~ .layout #flowView {{
      display: block;
    }}
    #view-flow:checked ~ .layout #dayNav {{
      display: none;
    }}
{day_css}
    main {{
      width: 100%;
      max-width: 1180px;
      padding: 28px;
    }}
    .topbar {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }}
    .search {{
      flex: 1;
      min-width: 240px;
      min-height: 42px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 9px 12px;
      font: inherit;
      background: #fff;
    }}
    .panel {{
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: 28px;
      margin-bottom: 18px;
    }}
    .helper {{
      margin: 0 0 16px;
      color: var(--muted);
      font-size: 14px;
    }}
    .doc h2, .doc h3, .doc h4 {{
      line-height: 1.25;
      margin: 28px 0 12px;
    }}
    .doc h2:first-child, .doc h3:first-child {{
      margin-top: 0;
    }}
    .doc p {{
      margin: 10px 0;
    }}
    .doc a {{
      color: var(--accent);
      font-weight: 650;
    }}
    .doc code {{
      background: var(--code);
      border-radius: 6px;
      padding: 2px 5px;
      font-size: 0.92em;
    }}
    pre {{
      overflow: auto;
      border-radius: 8px;
      background: #111827;
      color: #e5e7eb;
      padding: 16px;
    }}
    pre code {{
      background: transparent !important;
      color: inherit;
      padding: 0 !important;
    }}
    .table-wrap {{
      overflow: auto;
      border: 1px solid var(--line);
      border-radius: 8px;
      margin: 14px 0;
    }}
    table {{
      width: 100%;
      min-width: 560px;
      border-collapse: collapse;
    }}
    th, td {{
      border-bottom: 1px solid var(--line);
      padding: 10px 12px;
      text-align: left;
      vertical-align: top;
    }}
    th {{
      background: #f2f5f9;
      font-size: 13px;
    }}
    li {{
      margin: 6px 0;
    }}
    .task-section {{
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      margin-bottom: 12px;
      overflow: hidden;
    }}
    .task-section summary {{
      cursor: pointer;
      padding: 14px 16px;
      font-weight: 750;
      background: #f8fafc;
    }}
    .task-section .doc {{
      border-top: 1px solid var(--line);
      padding: 18px;
    }}
    .check-item {{
      list-style: none;
      margin-left: -24px;
    }}
    .check-item label {{
      display: inline-flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
    }}
    .check-item input {{
      margin-top: 5px;
      accent-color: var(--accent);
    }}
    .check-item input:checked + span {{
      color: var(--muted);
      text-decoration: line-through;
    }}
    .hidden {{
      display: none !important;
    }}
    @media (max-width: 880px) {{
      .layout {{
        display: block;
      }}
      .sidebar {{
        position: static;
        height: auto;
      }}
      main, .panel {{
        padding: 18px;
      }}
    }}
  </style>
</head>
<body>
  <input class="control-radio" type="radio" name="viewMode" id="view-daily" checked>
  <input class="control-radio" type="radio" name="viewMode" id="view-flow">
  {day_controls}
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <h1>AI Board Daily Plan</h1>
        <p>일자별 상세 할 일과 전체 태스크 흐름 체크표</p>
      </div>
      <div class="tabs">
        <label id="dailyTab" class="tab-label active" for="view-daily">일자별</label>
        <label id="flowTab" class="tab-label" for="view-flow">체크표</label>
      </div>
      <nav id="dayNav" class="day-nav" aria-label="일자 선택">
        {day_nav}
      </nav>
    </aside>
    <main>
      <div class="topbar">
        <input id="search" class="search" type="search" placeholder="검색: Day 2, RabbitMQ, JWT..." aria-label="검색">
        <div>
          <button id="prevDay" type="button">이전</button>
          <button id="nextDay" type="button">다음</button>
        </div>
      </div>
      <section id="dailyView">
        {day_cards}
      </section>
      <section id="flowView">
        <div class="panel">
          <p class="helper">전체 흐름 체크표입니다. 체크 상태는 이 브라우저의 localStorage에 저장됩니다.</p>
          {task_cards}
        </div>
      </section>
    </main>
  </div>
  <script>
    const checkStorageKey = "ai-board-planning-checks";
    const dayButtons = Array.from(document.querySelectorAll(".day-btn"));
    const dayCards = Array.from(document.querySelectorAll(".day-card"));
    const dailyTab = document.getElementById("dailyTab");
    const flowTab = document.getElementById("flowTab");
    const dayNav = document.getElementById("dayNav");
    const dailyView = document.getElementById("dailyView");
    const flowView = document.getElementById("flowView");
    const search = document.getElementById("search");
    const viewDaily = document.getElementById("view-daily");
    const viewFlow = document.getElementById("view-flow");
    let selectedDay = localStorage.getItem("ai-board-selected-day") || "1";
    let mode = "daily";
    let checks = JSON.parse(localStorage.getItem(checkStorageKey) || "{{}}");

    function selectDay(day) {{
      const targetInput = document.getElementById(`day-toggle-${{day}}`) || document.getElementById("day-toggle-1");
      targetInput.checked = true;
      selectedDay = targetInput.value;
      localStorage.setItem("ai-board-selected-day", selectedDay);
      dayButtons.forEach((button) => button.classList.toggle("active", button.dataset.day === selectedDay));
      dayCards.forEach((card) => card.classList.toggle("hidden", card.dataset.day !== selectedDay));
    }}

    function setMode(nextMode) {{
      mode = nextMode;
      viewDaily.checked = mode === "daily";
      viewFlow.checked = mode === "flow";
      dailyView.classList.toggle("hidden", mode !== "daily");
      flowView.classList.toggle("hidden", mode !== "flow");
      dayNav.classList.toggle("hidden", mode !== "daily");
      dailyTab.classList.toggle("active", mode === "daily");
      flowTab.classList.toggle("active", mode === "flow");
      applySearch();
    }}

    function applySearch() {{
      const query = search.value.trim().toLowerCase();
      if (mode === "daily") {{
        dayButtons.forEach((button) => {{
          const card = dayCards.find((item) => item.dataset.day === button.dataset.day);
          const match = !query || (card && card.dataset.search.includes(query));
          button.classList.toggle("hidden", !match);
        }});
      }} else {{
        document.querySelectorAll(".task-section").forEach((section) => {{
          section.classList.toggle("hidden", Boolean(query) && !section.dataset.search.includes(query));
          if (query) section.open = true;
        }});
      }}
    }}

    document.getElementById("prevDay").addEventListener("click", () => selectDay(Math.max(1, Number(selectedDay) - 1)));
    document.getElementById("nextDay").addEventListener("click", () => selectDay(Math.min(dayCards.length, Number(selectedDay) + 1)));
    dayButtons.forEach((button) => button.addEventListener("click", () => selectDay(button.dataset.day)));
    dailyTab.addEventListener("click", () => setMode("daily"));
    flowTab.addEventListener("click", () => setMode("flow"));
    search.addEventListener("input", applySearch);

    document.querySelectorAll("input[data-check-id]").forEach((input) => {{
      input.checked = Boolean(checks[input.dataset.checkId]);
      input.addEventListener("change", () => {{
        checks[input.dataset.checkId] = input.checked;
        localStorage.setItem(checkStorageKey, JSON.stringify(checks));
      }});
    }});

    selectDay(selectedDay);
  </script>
</body>
</html>
"""


def main() -> None:
    OUTPUT_PATH.write_text(build_html(), encoding="utf-8")
    print(f"Built {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
