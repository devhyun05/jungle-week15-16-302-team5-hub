#!/usr/bin/env python3
"""Small Trello CLI for creating and updating cards.

Credentials are read in this order:
1. Environment variables: TRELLO_API_KEY and TRELLO_TOKEN
2. A local .env file in the repo root or current directory
3. Interactive prompts

Example .env:
TRELLO_API_KEY=your_api_key
TRELLO_TOKEN=your_token
"""

from __future__ import annotations

import argparse
import getpass
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


BASE_URL = "https://api.trello.com"


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def load_dotenv() -> None:
    """Load simple KEY=VALUE lines without requiring python-dotenv."""
    candidates = [repo_root() / ".env", Path.cwd() / ".env"]
    for path in candidates:
        if not path.exists():
            continue
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def require_credentials() -> tuple[str, str]:
    load_dotenv()
    api_key = os.environ.get("TRELLO_API_KEY", "").strip()
    token = os.environ.get("TRELLO_TOKEN", "").strip()

    if not api_key:
        api_key = input("Trello API key: ").strip()
    if not token:
        token = getpass.getpass("Trello token: ").strip()

    if not api_key or not token:
        raise SystemExit("Missing Trello credentials.")

    return api_key, token


def cleaned(params: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in params.items() if value is not None}


def trello_request(
    method: str,
    path: str,
    params: dict[str, Any] | None = None,
) -> Any:
    api_key, token = require_credentials()
    payload = cleaned(params or {})
    payload.update({"key": api_key, "token": token})

    method = method.upper()
    url = f"{BASE_URL}{path}"
    data = None
    headers = {"Accept": "application/json"}

    if method == "GET" or method == "DELETE":
        url = f"{url}?{urllib.parse.urlencode(payload, doseq=True)}"
    else:
        data = urllib.parse.urlencode(payload, doseq=True).encode("utf-8")
        headers["Content-Type"] = "application/x-www-form-urlencoded"

    request = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Trello API error {exc.code}: {error_body}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Could not reach Trello API: {exc.reason}") from exc

    if not body:
        return None
    return json.loads(body)


def quote_id(value: str) -> str:
    return urllib.parse.quote(value, safe="")


def print_json(data: Any) -> None:
    print(json.dumps(data, ensure_ascii=False, indent=2))


def print_rows(rows: list[dict[str, Any]], columns: list[tuple[str, str]]) -> None:
    if not rows:
        print("No results.")
        return

    rendered_rows = []
    for row in rows:
        rendered_rows.append([str(row.get(key, "") or "") for key, _ in columns])

    widths = []
    for index, (_, heading) in enumerate(columns):
        max_value_width = max(len(row[index]) for row in rendered_rows)
        widths.append(max(len(heading), max_value_width))

    header = "  ".join(heading.ljust(widths[index]) for index, (_, heading) in enumerate(columns))
    rule = "  ".join("-" * width for width in widths)
    print(header)
    print(rule)
    for row in rendered_rows:
        print("  ".join(value.ljust(widths[index]) for index, value in enumerate(row)))


def list_boards(args: argparse.Namespace) -> None:
    boards = trello_request(
        "GET",
        "/1/members/me/boards",
        {"fields": "name,url,closed", "filter": args.filter},
    )
    if args.json:
        print_json(boards)
        return
    print_rows(boards, [("id", "ID"), ("name", "Name"), ("url", "URL")])


def list_lists(args: argparse.Namespace) -> None:
    lists = trello_request(
        "GET",
        f"/1/boards/{quote_id(args.board_id)}/lists",
        {"fields": "name,closed,pos", "filter": args.filter},
    )
    if args.json:
        print_json(lists)
        return
    print_rows(lists, [("id", "ID"), ("name", "Name"), ("closed", "Closed")])


def list_cards(args: argparse.Namespace) -> None:
    cards = trello_request(
        "GET",
        f"/1/lists/{quote_id(args.list_id)}/cards",
        {"fields": "name,due,dueComplete,url,closed", "filter": args.filter},
    )
    if args.json:
        print_json(cards)
        return
    print_rows(cards, [("id", "ID"), ("name", "Name"), ("due", "Due"), ("url", "URL")])


def get_card(args: argparse.Namespace) -> None:
    card = trello_request(
        "GET",
        f"/1/cards/{quote_id(args.card_id)}",
        {"fields": "name,desc,due,dueComplete,url,idList,labels,closed"},
    )
    print_json(card)


def create_card(args: argparse.Namespace) -> None:
    params = {
        "idList": args.list_id,
        "name": args.name,
        "desc": args.desc,
        "due": args.due,
        "idLabels": ",".join(args.label_ids) if args.label_ids else None,
        "idMembers": ",".join(args.member_ids) if args.member_ids else None,
        "pos": args.position,
    }
    card = trello_request("POST", "/1/cards", params)
    if args.json:
        print_json(card)
        return
    print(f"Created: {card['name']}")
    print(f"ID: {card['id']}")
    print(f"URL: {card['url']}")


def parse_bool(value: str) -> str:
    normalized = value.lower()
    if normalized in {"true", "t", "yes", "y", "1"}:
        return "true"
    if normalized in {"false", "f", "no", "n", "0"}:
        return "false"
    raise argparse.ArgumentTypeError("Use true or false.")


def update_card(args: argparse.Namespace) -> None:
    if args.archive and args.unarchive:
        raise SystemExit("Use only one of --archive or --unarchive.")

    params = {
        "name": args.name,
        "desc": args.desc,
        "due": None if not args.clear_due else "null",
        "dueComplete": args.due_complete,
        "idList": args.list_id,
        "closed": "true" if args.archive else "false" if args.unarchive else None,
    }
    if args.due:
        params["due"] = args.due

    if all(value is None for value in params.values()):
        raise SystemExit("Nothing to update. Pass at least one update option.")

    card = trello_request("PUT", f"/1/cards/{quote_id(args.card_id)}", params)
    if args.json:
        print_json(card)
        return
    print(f"Updated: {card['name']}")
    print(f"ID: {card['id']}")
    print(f"URL: {card['url']}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Create and update Trello cards.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    boards = subparsers.add_parser("list-boards", help="List your Trello boards.")
    boards.add_argument("--filter", default="open", choices=["all", "closed", "open", "organization", "public", "starred"])
    boards.add_argument("--json", action="store_true", help="Print raw JSON.")
    boards.set_defaults(func=list_boards)

    lists = subparsers.add_parser("list-lists", help="List lists in a board.")
    lists.add_argument("board_id", help="Trello board ID.")
    lists.add_argument("--filter", default="open", choices=["all", "closed", "none", "open"])
    lists.add_argument("--json", action="store_true", help="Print raw JSON.")
    lists.set_defaults(func=list_lists)

    cards = subparsers.add_parser("list-cards", help="List cards in a list.")
    cards.add_argument("list_id", help="Trello list ID.")
    cards.add_argument("--filter", default="open", choices=["all", "closed", "none", "open"])
    cards.add_argument("--json", action="store_true", help="Print raw JSON.")
    cards.set_defaults(func=list_cards)

    card = subparsers.add_parser("get-card", help="Show one card as JSON.")
    card.add_argument("card_id", help="Trello card ID.")
    card.set_defaults(func=get_card)

    create = subparsers.add_parser("create-card", help="Create a card in a list.")
    create.add_argument("list_id", help="Target Trello list ID.")
    create.add_argument("name", help="Card title.")
    create.add_argument("--desc", default="", help="Card description.")
    create.add_argument("--due", help="Due date, for example 2026-06-08 or 2026-06-08T09:00:00+09:00.")
    create.add_argument("--label-id", dest="label_ids", action="append", help="Label ID to attach. Can be repeated.")
    create.add_argument("--member-id", dest="member_ids", action="append", help="Member ID to attach. Can be repeated.")
    create.add_argument("--position", default="bottom", choices=["top", "bottom"], help="Card position in the list.")
    create.add_argument("--json", action="store_true", help="Print raw JSON.")
    create.set_defaults(func=create_card)

    update = subparsers.add_parser("update-card", help="Update a card.")
    update.add_argument("card_id", help="Trello card ID.")
    update.add_argument("--name", help="New card title.")
    update.add_argument("--desc", help="New card description.")
    update.add_argument("--due", help="New due date, for example 2026-06-08 or 2026-06-08T09:00:00+09:00.")
    update.add_argument("--clear-due", action="store_true", help="Remove the due date.")
    update.add_argument("--due-complete", type=parse_bool, help="Set due completion: true or false.")
    update.add_argument("--list-id", help="Move card to another list ID.")
    update.add_argument("--archive", action="store_true", help="Archive the card.")
    update.add_argument("--unarchive", action="store_true", help="Unarchive the card.")
    update.add_argument("--json", action="store_true", help="Print raw JSON.")
    update.set_defaults(func=update_card)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("\nCanceled.")
