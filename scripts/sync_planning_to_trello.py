#!/usr/bin/env python3
"""Sync Day sections from docs/planning/schedule.md to Trello cards.

This script creates or updates one card per Day in a target Trello list.
Credentials are loaded by scripts/trello.py from environment variables,
.env, or interactive prompts.

Examples:
  python3 scripts/sync_planning_to_trello.py <list_id> --dry-run
  python3 scripts/sync_planning_to_trello.py <list_id>
  python3 scripts/sync_planning_to_trello.py <list_id> --start-date 2026-06-06
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parents[0]
SCHEDULE_PATH = ROOT / "docs" / "planning" / "schedule.md"

sys.path.insert(0, str(SCRIPT_DIR))
from trello import quote_id, trello_request  # noqa: E402


DAY_HEADING_RE = re.compile(r"^## Day\s+(\d+)\s+-\s+(.+)$", re.MULTILINE)
SUBHEADING_RE = re.compile(r"^###\s+(.+)$", re.MULTILINE)
MARKER_PREFIX = "AI_BOARD_PLAN_DAY"


def parse_days(markdown: str) -> list[dict[str, Any]]:
    matches = list(DAY_HEADING_RE.finditer(markdown))
    days: list[dict[str, Any]] = []
    for index, match in enumerate(matches):
        next_start = matches[index + 1].start() if index + 1 < len(matches) else len(markdown)
        block = markdown[match.start() : next_start].strip()
        footer_match = re.search(r"\n## (필수|매일)\s", block)
        if footer_match:
            block = block[: footer_match.start()].strip()
        number = int(match.group(1))
        title = match.group(2).strip()
        sections = parse_subsections(block)
        days.append(
            {
                "number": number,
                "title": title,
                "markdown": block,
                "sections": sections,
                "marker": f"{MARKER_PREFIX}:{number}",
            }
        )
    return days


def parse_subsections(block: str) -> dict[str, str]:
    matches = list(SUBHEADING_RE.finditer(block))
    sections: dict[str, str] = {}
    for index, match in enumerate(matches):
        next_start = matches[index + 1].start() if index + 1 < len(matches) else len(block)
        title = match.group(1).strip()
        body = block[match.end() : next_start].strip()
        sections[title] = body
    return sections


def extract_list_items(markdown: str, max_items: int | None = None) -> list[str]:
    items: list[str] = []
    for raw_line in markdown.splitlines():
        line = raw_line.strip()
        ordered = re.match(r"^\d+\.\s+(.+)$", line)
        bullet = re.match(r"^-\s+(?:\[[ xX]\]\s+)?(.+)$", line)
        item = ordered.group(1) if ordered else bullet.group(1) if bullet else None
        if item:
            cleaned = re.sub(r"`([^`]+)`", r"\1", item)
            cleaned = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1: \2", cleaned)
            items.append(cleaned.strip())
        if max_items and len(items) >= max_items:
            break
    return items


def build_card_description(day: dict[str, Any]) -> str:
    sections = day["sections"]
    parts = [
        f"{day['marker']}",
        "",
        f"Source: docs/planning/schedule.md",
        "",
        "## 오늘 이해할 것",
        sections.get("오늘 이해할 것", "일정표를 확인한다."),
        "",
        "## 시간 부족하면 줄일 것",
        sections.get("시간 부족하면 줄일 것", "Core 구현을 먼저 마무리한다."),
    ]
    return "\n".join(parts).strip()


def build_due(start_date: str | None, day_number: int, timezone_name: str) -> str | None:
    if not start_date:
        return None
    base = date.fromisoformat(start_date)
    due_day = base + timedelta(days=day_number - 1)
    local_due = datetime.combine(due_day, time(hour=23, minute=59), tzinfo=ZoneInfo(timezone_name))
    due_at = local_due.astimezone(timezone.utc)
    return due_at.isoformat().replace("+00:00", "Z")


def get_existing_cards(list_id: str) -> dict[int, dict[str, Any]]:
    cards = trello_request(
        "GET",
        f"/1/lists/{quote_id(list_id)}/cards",
        {"fields": "name,desc,url,closed", "filter": "open"},
    )
    existing: dict[int, dict[str, Any]] = {}
    for card in cards:
        desc = card.get("desc") or ""
        match = re.search(rf"{MARKER_PREFIX}:(\d+)", desc)
        if match:
            existing[int(match.group(1))] = card
    return existing


def create_checklist(card_id: str, name: str, items: list[str], dry_run: bool) -> None:
    if not items:
        return
    if dry_run:
        print(f"  checklist: {name} ({len(items)} items)")
        return
    checklist = trello_request(
        "POST",
        f"/1/cards/{quote_id(card_id)}/checklists",
        {"name": name},
    )
    checklist_id = checklist["id"]
    for item in items:
        trello_request(
            "POST",
            f"/1/checklists/{quote_id(checklist_id)}/checkItems",
            {"name": item, "pos": "bottom", "checked": "false"},
        )


def sync_day(
    list_id: str,
    day: dict[str, Any],
    existing_card: dict[str, Any] | None,
    args: argparse.Namespace,
) -> None:
    name = f"{args.prefix} Day {day['number']} - {day['title']}"
    desc = build_card_description(day)
    due = build_due(args.start_date, day["number"], args.timezone)
    sections = day["sections"]
    work_items = extract_list_items(sections.get("작업 순서", ""), args.max_check_items)
    done_items = extract_list_items(sections.get("완료 기준", ""), args.max_check_items)

    if args.dry_run:
        action = "update" if existing_card else "create"
        print(f"{action}: {name}")
        print(f"  due: {due or 'none'}")
        print(f"  desc: {len(desc)} chars")
        print(f"  작업 순서: {len(work_items)} items")
        print(f"  완료 기준: {len(done_items)} items")
        return

    if existing_card:
        card = trello_request(
            "PUT",
            f"/1/cards/{quote_id(existing_card['id'])}",
            {"name": name, "desc": desc, "due": due},
        )
        print(f"Updated: {card['name']} ({card['url']})")
        return

    card = trello_request(
        "POST",
        "/1/cards",
        {"idList": list_id, "name": name, "desc": desc, "due": due, "pos": "bottom"},
    )
    print(f"Created: {card['name']} ({card['url']})")
    create_checklist(card["id"], "작업 순서", work_items, args.dry_run)
    create_checklist(card["id"], "완료 기준", done_items, args.dry_run)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Sync planning days to Trello cards.")
    parser.add_argument("list_id", help="Target Trello list ID.")
    parser.add_argument("--schedule", default=str(SCHEDULE_PATH), help="Path to schedule.md.")
    parser.add_argument("--prefix", default="AI Board", help="Card title prefix.")
    parser.add_argument("--start-date", help="Optional YYYY-MM-DD date for Day 1 due date.")
    parser.add_argument("--timezone", default="Asia/Seoul", help="Timezone for --start-date due dates.")
    parser.add_argument("--only-day", type=int, action="append", help="Sync only this day. Can be repeated.")
    parser.add_argument("--max-check-items", type=int, default=50, help="Max checklist items per checklist.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned changes without calling Trello.")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    schedule_path = Path(args.schedule)
    days = parse_days(schedule_path.read_text(encoding="utf-8"))
    if args.only_day:
        selected = set(args.only_day)
        days = [day for day in days if day["number"] in selected]

    if not days:
        raise SystemExit("No Day sections found.")

    existing = {} if args.dry_run else get_existing_cards(args.list_id)
    for day in days:
        sync_day(args.list_id, day, existing.get(day["number"]), args)


if __name__ == "__main__":
    main()
